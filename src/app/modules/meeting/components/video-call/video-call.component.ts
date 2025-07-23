import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.scss']
})
export class VideoCallComponent implements OnInit {
  isMuted = false;
  isVideoStopped = false;
  videoOn = true;
  userIdTail: string = 'XXXX';
  mediaStream!: MediaStream;
  meetingId: string = '';
isVideoOff: any;
  router: any;

  constructor(private route: ActivatedRoute) {} 

@ViewChild('videoElement', { static: true }) videoElementRef!: ElementRef<HTMLVideoElement>;

  ngOnInit(): void {
    this.startVideo();
    const userId = localStorage.getItem('userId') || '';
    this.userIdTail = userId.slice(-4).padStart(4, '0');
    this.meetingId = this.route.snapshot.paramMap.get('id') || '';
    console.log('Meeting ID:', this.meetingId);
    console.log('VideoCallComponent loaded');
    const id = this.route.snapshot.paramMap.get('id');
    console.log('Meeting ID:', id);
  }

async startVideo() {
  try {
    this.mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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
    try {
      const screenStream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true });
      this.videoElementRef.nativeElement.srcObject = screenStream;
    } catch (error) {
      console.error('Screen sharing failed', error);
      alert('Screen sharing failed or was denied.');
    }
  }

  leaveCall() {
  if (this.mediaStream) {
    this.mediaStream.getTracks().forEach(track => track.stop());
  }
  this.isMuted = false;
  this.isVideoStopped = true;
  this.router.navigate(['/layout']); // or your correct landing page route
}


  openParticipants() {
    alert('Participants list will open (feature not implemented yet).');
  }

  openChat() {
    alert('Chat will open (feature not implemented yet).');
  }

  sendReaction() {
    alert('Reaction sent!');
  }

  openSecurityOptions() {
    alert('Security settings will open (feature not implemented yet).');
  }
}
