import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ChatComponent } from '../chat/chat.component';
import { UserDataService } from 'src/app/core/services/user-data.service';
import { WebSocketService } from 'src/app/core/services/websocket.service';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule, MatIconModule,ChatComponent],
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.scss']
})
export class VideoCallComponent implements OnInit {
  isMuted = false;
  isVideoStopped = false;
  videoOn = true;
  showEmojiPicker = false;
  raisedHand = false;
  userIdTail: string = 'XXXX';
  mediaStream!: MediaStream;
  meetingId: string = '';
 isVideoOff: any;
  username: string = '';
  showChat: boolean = false;
  isChatVisible: any;
  chatMessages: any[] = [];

  @ViewChild('videoElement', { static: true }) videoElementRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('screenVideoElement', { static: true }) screenVideoElementRef!: ElementRef<HTMLVideoElement>;
  screenStream: any;
screenSharing: any;
  peerConnection: any;


  constructor(private route: ActivatedRoute,
    private router: Router,
    public userDataService: UserDataService,
    private websocketService: WebSocketService
  ) {} 

  ngOnInit(): void {
    this.startVideo();
    const userId = localStorage.getItem('userId') || '';
    this.username = userId.slice(-4).padStart(4, '0');
    this.meetingId = this.route.snapshot.paramMap.get('id') || '';
     this.websocketService.connect(this.meetingId); // ✅ Connect WebSocket
    this.websocketService.onSignal().subscribe((signal: any) => {
      this.handleIncomingSignal(signal); // ✅ Handle remote screen share (future)
    });
    console.log('Meeting ID:', this.meetingId);
    console.log('VideoCallComponent loaded');
    const id = this.route.snapshot.paramMap.get('id');
    console.log('Meeting ID:', id);
  }

async startVideo() {
  try {
    const previousMuteState = this.isMuted; // save mute state
    this.mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    // Apply mute state to new audio tracks
    this.mediaStream.getAudioTracks().forEach(track => {
      track.enabled = !previousMuteState;
    });

    const video = this.videoElementRef.nativeElement;
    video.srcObject = this.mediaStream;
    video.play();
  } catch (error) {
    console.error('Camera access failed', error);
    alert('Unable to access camera.');
  }
}


  toggleMute() {
    this.isMuted = !this.isMuted;
    this.mediaStream?.getAudioTracks().forEach(track => (track.enabled = !this.isMuted));
  }
  
  
  toggleReactions() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

async toggleVideo() {
  this.isVideoStopped = !this.isVideoStopped;

  if (this.isVideoStopped) {
    // Turn off camera and remove video feed
    this.mediaStream?.getVideoTracks().forEach(track => track.stop());
    this.videoElementRef.nativeElement.srcObject = null;
  } else {
    // Restart camera and video feed
    await this.startVideo();
  }
}

   async shareScreen() {
  console.log('Its in development phase');
}


  leaveCall() {
  if (this.mediaStream) {
    this.mediaStream.getTracks().forEach(track => track.stop());
  }
  if (this.screenStream) {
      this.screenStream.getTracks().forEach((track: { stop: () => any; }) => track.stop());
    }
  this.isMuted = false;
  this.isVideoStopped = true;
  this.websocketService.disconnect(); // ✅ Clean disconnect
  this.router.navigate(['/layout']); // or your correct landing page route
}


   openParticipants()
    { alert('Participants feature coming soon'); }

  openChat()
   { this.showChat = !this.showChat; }
   
 sendReaction(emoji: string) {
    alert(`You reacted with ${emoji}`);
    this.showEmojiPicker = false;
  }
  
  
raiseHand() {
  this.raisedHand = !this.raisedHand;
}

  openSecurityOptions() 
  { alert('Security options coming soon'); }

  handleMessageSent(message: any) {
    this.chatMessages.push(message);
    this.websocketService.sendChatMessage(this.meetingId, message);
  }

  // ✅ Optional: Handle remote screen signals (future use)
  handleIncomingSignal(signal: any) {
    if (signal.type === 'SCREEN_SHARE_STARTED') {
      console.log(`${signal.sender} started screen sharing.`);
    } else if (signal.type === 'SCREEN_SHARE_ENDED') {
      console.log(`${signal.sender} stopped screen sharing.`);
    }
  }

  ngOnDestroy(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
  }
}