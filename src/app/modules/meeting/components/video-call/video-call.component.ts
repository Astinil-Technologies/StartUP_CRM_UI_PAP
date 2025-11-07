import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ChatComponent } from '../chat/chat.component';
import { ParticipantsComponent } from '../participants/participants.component';
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
    private websocketService: WebSocketService,
    private dialog: MatDialog
  ) {} 

  ngOnInit(): void {
    this.startVideo();
    const user = this.userDataService.getCurrentUserData();
    this.username = user?.firstName + ' ' + user?.lastName || 'User';
    this.meetingId = this.route.snapshot.paramMap.get('id') || '';
    
    // Connect to WebSocket for real-time communication
    this.websocketService.connect(this.meetingId);
    
    // Subscribe to participant updates
    this.websocketService.onParticipantUpdate().subscribe((update: any) => {
      console.log('Participant update:', update);
    });
    
    // Subscribe to WebRTC signals
    this.websocketService.onSignal().subscribe((signal: any) => {
      this.handleIncomingSignal(signal);
    });
    
    console.log('Meeting ID:', this.meetingId);
    console.log('VideoCallComponent loaded');
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
    
    // Notify other participants
    const action = this.isMuted ? 'MUTE_AUDIO' : 'UNMUTE_AUDIO';
    this.websocketService.sendParticipantAction(this.meetingId, {
      userId: this.userDataService.getCurrentUserData()?.id,
      action: action,
      timestamp: Date.now()
    });
  }
  
  
  toggleReactions() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

async toggleVideo() {
  this.isVideoStopped = !this.isVideoStopped;

  if (this.isVideoStopped) {
    this.mediaStream?.getVideoTracks().forEach(track => track.stop());
    this.videoElementRef.nativeElement.srcObject = null;
  } else {
    await this.startVideo();
  }
  
  // Notify other participants
  const action = this.isVideoStopped ? 'TURN_OFF_VIDEO' : 'TURN_ON_VIDEO';
  this.websocketService.sendParticipantAction(this.meetingId, {
    userId: this.userDataService.getCurrentUserData()?.id,
    action: action,
    timestamp: Date.now()
  });
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
  this.websocketService.disconnect();
  this.router.navigate(['/layout']);
}


   openParticipants() {
    this.dialog.open(ParticipantsComponent, {
      width: '450px',
      data: { meetingId: this.meetingId },
      disableClose: false
    });
  }

  openChat()
   { this.showChat = !this.showChat; }
   
 sendReaction(emoji: string) {
    alert(`You reacted with ${emoji}`);
    this.showEmojiPicker = false;
  }
  
  
raiseHand() {
  this.raisedHand = !this.raisedHand;
  
  // Notify other participants
  const action = this.raisedHand ? 'RAISE_HAND' : 'LOWER_HAND';
  this.websocketService.sendParticipantAction(this.meetingId, {
    userId: this.userDataService.getCurrentUserData()?.id,
    action: action,
    timestamp: Date.now()
  });
}

  openSecurityOptions() 
  { alert('Security options coming soon'); }

  handleMessageSent(message: any) {
    // Chat component handles sending messages directly via STOMP
    // This method can be used for additional processing if needed
    console.log('Message sent:', message);
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