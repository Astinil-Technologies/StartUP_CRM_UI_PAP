import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MeetingService } from 'src/app/core/services/meeting.service';
import { Subscription } from 'rxjs';
import { WebSocketService } from 'src/app/core/services/websocket.service';

export interface Participant {
  userId: number;
  username: string;
  role: string;
  status: string;
  audioMuted?: boolean;
  videoOff?: boolean;
  handRaised?: boolean;
  inWaitingRoom?: boolean;
}

@Component({
  selector: 'app-participants',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDialogModule],
  templateUrl: './participants.component.html',
  styleUrls: ['./participants.component.scss']
})
export class ParticipantsComponent implements OnInit, OnDestroy {
  @Input() data!: { meetingId: string };

  meetingId: string = '';
  participants: Participant[] = [];
  private subscription?: Subscription;
  private wsSubscription?: Subscription;

  constructor(private meetingService: MeetingService, private websocketService: WebSocketService) {}

  ngOnInit(): void {
    this.meetingId = this.data?.meetingId || '';
    this.loadParticipants();
    this.websocketService.connect(this.meetingId);
    this.wsSubscription = this.websocketService.onParticipantUpdate().subscribe((update: any) => {
      this.handleParticipantUpdate(update);
    });
  }

  private loadParticipants(): void {
    this.meetingService.getParticipants(this.meetingId).subscribe({
      next: (participants) => {
        this.participants = participants;
      },
      error: (err) => console.error('Error loading participants:', err)
    });
  }

  // WebSocket updated subscription handled through WebSocketService

  private handleParticipantUpdate(update: any): void {
    const userId = update.userId;
    const index = this.participants.findIndex(p => p.userId === userId);

    if (index !== -1) {
      this.participants[index] = {
        ...this.participants[index],
        audioMuted: update.action === 'MUTE_AUDIO' ? true :
                    update.action === 'UNMUTE_AUDIO' ? false :
                    this.participants[index].audioMuted,

        videoOff: update.action === 'TURN_OFF_VIDEO' ? true :
                  update.action === 'TURN_ON_VIDEO' ? false :
                  this.participants[index].videoOff,

        handRaised: update.action === 'RAISE_HAND' ? true :
                    update.action === 'LOWER_HAND' ? false :
                    this.participants[index].handRaised
      };
    } else {
      this.participants.push({
        userId: update.userId,
        username: update.username,
        role: update.role || 'USER',
        status: 'ACTIVE',
        audioMuted: false,
        videoOff: false,
        handRaised: update.action === 'RAISE_HAND'
      });
    }
  }

  close(): void {
    this.participants = [];
  }

  
  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
