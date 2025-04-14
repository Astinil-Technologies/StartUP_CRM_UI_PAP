import {
  Component, OnInit, OnDestroy, ViewChild, ElementRef, inject
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatComponent } from '../chat/chat.component';
import { MatDialog } from '@angular/material/dialog';
import { ScheduleMeetingDialogComponent } from '../schedule-meeting-dialog/schedule-meeting-dialog.component';
import { io, Socket } from 'socket.io-client';
import Peer from 'peerjs';
type IOSocket = typeof import("socket.io-client").Socket;

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatComponent],
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.scss']
})
export default class VideoCallComponent implements OnInit, OnDestroy {
  @ViewChild('myVideo') myVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild(ChatComponent) chatComponent!: ChatComponent;

  private dialog = inject(MatDialog);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private io = inject(io);
  private location: Location = inject(Location);
  meetingId: string = '';
  meetingJoined: boolean = false;

  myStream!: MediaStream;
  remoteStream!: MediaStream;
  peerConnection!: RTCPeerConnection;
  peer!: Peer;
  socket!: Socket;
  
  remotePeerId: string = '';

  isMuted = false;
  isCameraOn = true;
  isScreenSharing = false;
  isRecording = false;
  isChatOpen = false;

  mediaRecorder!: MediaRecorder;
  recordedChunks: Blob[] = [];
  recordingTime = 0;
  recordingInterval: any;

  

  async ngOnInit() {
    this.meetingId = this.route.snapshot.paramMap.get('id') || '';
    if (this.meetingId) await this.joinMeeting();
  }
  constructor() {
    this.socket = io('http://localhost:3000');
  }

  createMeeting(): void {
    const dialogRef = this.dialog.open(ScheduleMeetingDialogComponent, { width: '400px' });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      const meetingId = Math.random().toString(36).substring(2, 10);
      const meetingLink = `/meet/${meetingId}`;

      if (result.startNow) {
        this.router.navigate([meetingLink]);
      } else {
        const meetingDetails = {
          id: meetingId,
          date: result.meetingDate,
          time: result.meetingTime,
          duration: result.duration,
          link: `${window.location.origin}${meetingLink}`,
        };

        alert(`✅ Meeting Scheduled!\n\n📅 Date: ${meetingDetails.date}\n⏰ Time: ${meetingDetails.time}\n⏳ Duration: ${meetingDetails.duration} hour(s)\n🔗 Link: ${meetingDetails.link}`);
      }
    });
  }

  async joinMeeting(): Promise<void> {
    if (!this.meetingId.trim()) return alert('Invalid Meeting ID.');
    await this.initializeMedia();
    this.initializeSocketAndPeer();
    this.meetingJoined = true;
  }

  async initializeMedia(): Promise<void> {
    try {
      this.myStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      this.myVideo.nativeElement.srcObject = this.myStream;
    } catch (err) {
      alert('Error accessing camera/mic.');
    }
  }

  initializeSocketAndPeer(): void {
    this.socket = io('http://localhost:3000'); // Replace with your signaling server

    this.peer = new Peer();
    this.peer.on('open', (id: string) => {
      this.socket.emit('join-meeting', { meetingId: this.meetingId, peerId: id });
    });

    this.socket.on('user-connected', (peerId: string) => {
      this.connectToNewUser(peerId);
    });

    this.peer.on('call', (call) => {
      call.answer(this.myStream);
      call.on('stream', (remoteStream) => {
        this.remoteVideo.nativeElement.srcObject = remoteStream;
      });
    });
  }

  connectToNewUser(peerId: string): void {
    const call = this.peer.call(peerId, this.myStream);
    call.on('stream', (remoteStream) => {
      this.remoteVideo.nativeElement.srcObject = remoteStream;
    });
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;
    this.myStream.getAudioTracks().forEach(track => (track.enabled = !this.isMuted));
  }

  toggleCamera(): void {
    this.isCameraOn = !this.isCameraOn;
    this.myStream.getVideoTracks().forEach(track => (track.enabled = this.isCameraOn));
  }

  async toggleScreenShare(): Promise<void> {
    if (!this.isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const sender = this.myStream.getVideoTracks()[0];
        const screenTrack = screenStream.getVideoTracks()[0];
        const senderObj = this.peerConnection?.getSenders()?.find(s => s.track?.kind === 'video');

        if (senderObj) senderObj.replaceTrack(screenTrack);
        this.isScreenSharing = true;

        screenTrack.onended = () => {
          senderObj?.replaceTrack(sender);
          this.isScreenSharing = false;
        };
      } catch (err) {
        console.error('Screen sharing error:', err);
      }
    }
  }

  startRecording(): void {
    this.recordedChunks = [];
    this.recordingTime = 0;
    this.isRecording = true;

    this.mediaRecorder = new MediaRecorder(this.myStream, {
      mimeType: 'video/webm; codecs=vp9'
    });

    this.mediaRecorder.ondataavailable = (event) => this.recordedChunks.push(event.data);
    this.mediaRecorder.onstop = this.downloadRecording.bind(this);

    this.mediaRecorder.start();
    this.startTimer();
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.stopTimer();
    }
  }

  downloadRecording(): void {
    const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-recording-${this.meetingId}.webm`;
    a.click();
  }

  startTimer(): void {
    this.recordingInterval = setInterval(() => this.recordingTime++, 1000);
  }

  stopTimer(): void {
    clearInterval(this.recordingInterval);
  }

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
  }

  leaveCall(): void {
    this.peer?.destroy();
    this.socket?.disconnect();
    this.myStream?.getTracks().forEach(track => track.stop());
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.leaveCall();
  }
}

