import {Component,OnInit,ViewChild,ElementRef,ViewEncapsulation,HostListener,OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatComponent } from '../chat/chat.component';
import { ParticipantsComponent } from '../participants/participants.component';
import { UserDataService } from 'src/app/core/services/user-data.service';
import { WebSocketService } from 'src/app/core/services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule, MatIconModule, ChatComponent, ParticipantsComponent],
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VideoCallComponent implements OnInit {
  // ✅ States
  isMuted = false;
  isVideoStopped = false;
  raisedHand = false;
  showEmojiPicker = false;
  showParticipants = false;
  showChat = false;
  screenSharing = false;
  loading = true;

  // ✅ Streams
  mediaStream!: MediaStream;
  screenStream: any;
  peerConnection: any;

  // ✅ User info
  username: string = '';
  meetingId: string = '';
  chatMessages: any[] = [];

  // ✅ Floating Reactions
  floatingEmojis: { id: number; emoji: string }[] = [];
  private participantSubscription?: Subscription;
  private signalSubscription?: Subscription;

  @ViewChild('videoElement', { static: true })
  videoElementRef!: ElementRef<HTMLVideoElement>;

  @ViewChild('screenVideoElement', { static: true })
  screenVideoElementRef!: ElementRef<HTMLVideoElement>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public userDataService: UserDataService,
    private websocketService: WebSocketService,
    private dialog: MatDialog
  ) {}

  // ✅ Lifecycle Init
  ngOnInit(): void {
    this.startVideo();

    const user = this.userDataService.getCurrentUserData();
    this.username = user?.firstName + ' ' + user?.lastName || 'User';
    this.meetingId = this.route.snapshot.paramMap.get('id') || '';

    // WebSocket connection
    this.websocketService.connect(this.meetingId);

    // Listen to participant updates
    this.participantSubscription = this.websocketService.onParticipantUpdate().subscribe((update: any) => {
      console.log('Participant update:', update);
    });

    // Listen to incoming WebRTC signals
    this.signalSubscription = this.websocketService.onSignal().subscribe((signal: any) => {
      this.handleIncomingSignal(signal);
    });

    console.log('Meeting ID:', this.meetingId);
  }

  // ✅ Initialize user video & audio
  async startVideo() {
    try {
      this.loading = true;
      const previousMuteState = this.isMuted;

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.mediaStream.getAudioTracks().forEach(track => {
        track.enabled = !previousMuteState;
      });

      const video = this.videoElementRef.nativeElement;
      // Ensure local preview is muted so you won't hear your mic locally
      // (the template already sets 'muted', but we set it here for extra safety)
      video.muted = true;
      video.srcObject = this.mediaStream;
      await video.play();
    } catch (error) {
      console.error('Camera access failed', error);
      alert('Unable to access camera.');
    } finally {
      this.loading = false;
    }
  }

  // ✅ Mute / Unmute
  toggleMute() {
    this.isMuted = !this.isMuted;
    this.mediaStream?.getAudioTracks().forEach(
      track => (track.enabled = !this.isMuted)
    );

    const action = this.isMuted ? 'MUTE_AUDIO' : 'UNMUTE_AUDIO';
    this.websocketService.sendParticipantAction(this.meetingId, {
      userId: this.userDataService.getCurrentUserData()?.id,
      action,
      timestamp: Date.now()
    });
  }

  // ✅ Toggle video
  async toggleVideo() {
    this.isVideoStopped = !this.isVideoStopped;
  const videoTrack = this.mediaStream.getVideoTracks()[0];

  if (this.isVideoStopped) {
    videoTrack.enabled = false;
  } else {
    videoTrack.enabled = true;
  }

  this.videoElementRef.nativeElement.srcObject = this.mediaStream;
  this.videoElementRef.nativeElement.play();


    const action = this.isVideoStopped ? 'TURN_OFF_VIDEO' : 'TURN_ON_VIDEO';
    this.websocketService.sendParticipantAction(this.meetingId, {
      userId: this.userDataService.getCurrentUserData()?.id,
      action,
      timestamp: Date.now()
    });
  }

  // ✅ Raise Hand
  raiseHand() {
    this.raisedHand = !this.raisedHand;

    const action = this.raisedHand ? 'RAISE_HAND' : 'LOWER_HAND';
    this.websocketService.sendParticipantAction(this.meetingId, {
      userId: this.userDataService.getCurrentUserData()?.id,
      action,
      timestamp: Date.now()
    });
  }

  // ✅ Toggle Chat
  openChat() {
    this.showChat = !this.showChat;
  }

  // ✅ Toggle Participants
  openParticipants() {
    this.showParticipants = !this.showParticipants;
  }

  // ✅ Toggle Emoji Picker
  toggleReactions() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  // ✅ Floating Emoji Reactions 🎉
  sendReaction(emoji: string) {
    const id = Date.now();
    this.floatingEmojis.push({ id, emoji });

    // Remove after animation
    setTimeout(() => {
      this.floatingEmojis = this.floatingEmojis.filter(e => e.id !== id);
    }, 1500);

    this.showEmojiPicker = false;

    this.websocketService.sendParticipantAction(this.meetingId, {
      userId: this.userDataService.getCurrentUserData()?.id,
      action: `REACTION_${emoji}`,
      timestamp: Date.now()
    });
  }

  // ✅ Screen Sharing
  async shareScreen() {
    try {
      this.screenStream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: true,
        audio: true
      });

      const videoElem = this.screenVideoElementRef.nativeElement;
      // Keep local screen preview muted to avoid hearing shared audio locally
      videoElem.muted = true;
      videoElem.srcObject = this.screenStream;
      this.screenSharing = true;

      this.screenStream.getVideoTracks()[0].onended = () => {
        this.screenSharing = false;
      };
    } catch (err) {
      console.error('Screen sharing failed', err);
    }
  }

  // ✅ Settings Placeholder
  openSecurityOptions() {
    alert('Security options coming soon!');
  }

  // ✅ Leave Call & Cleanup
  leaveCall() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track: any) => track.stop());
    }

    this.isMuted = false;
    this.isVideoStopped = true;

    this.websocketService.disconnect();
    this.router.navigate(['/layout']);
  }

  // ✅ Incoming WebRTC / WebSocket signals
  handleIncomingSignal(signal: any) {
    if (signal.type === 'SCREEN_SHARE_STARTED') {
      console.log(`${signal.sender} started screen sharing.`);
    } else if (signal.type === 'SCREEN_SHARE_ENDED') {
      console.log(`${signal.sender} stopped screen sharing.`);
    }
  }

  // ✅ Message Handler from Chat
  handleMessageSent(message: any) {
    console.log('Message sent:', message);
    // Keep parent chat messages in sync whenever a message is sent from the chat component
    try {
      const m = typeof message === 'string' ? JSON.parse(message) : message;
      const chatMsg = { sender: m.sender, content: m.message, timestamp: new Date(m.timestamp || Date.now()) };
      const duplicate = this.chatMessages.some(c => c.sender === chatMsg.sender && c.content === chatMsg.content && Math.abs(new Date(c.timestamp || 0).getTime() - chatMsg.timestamp.getTime()) < 2000);
      if (!duplicate) {
        this.chatMessages.push(chatMsg);
      }
      localStorage.setItem(`chat_${this.meetingId}`, JSON.stringify(this.chatMessages));
    } catch (err) {
      console.warn('Failed to normalize message for parent chat display', err);
    }
  }

@HostListener('window:beforeunload')
beforeUnloadHandler() {
  this.leaveCall();
  }
  // ✅ On Destroy Cleanup
  ngOnDestroy(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
    if (this.participantSubscription) {
      this.participantSubscription.unsubscribe();
    }
    if (this.signalSubscription) {
      this.signalSubscription.unsubscribe();
    }
  }
}