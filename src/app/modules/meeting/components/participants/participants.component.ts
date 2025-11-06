import { Component, Input, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MeetingService } from 'src/app/core/services/meeting.service';
import { Client, IMessage } from '@stomp/stompjs';
import { Subscription } from 'rxjs';

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
  template: `
    <div class="participants-dialog">
      <div class="dialog-header">
        <h2>Participants ({{ participants.length }})</h2>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      
      <div class="participants-list">
        <div *ngFor="let participant of participants" class="participant-item" [ngClass]="participant.role.toLowerCase()">
          <div class="participant-info">
            <div class="participant-name">
              <span class="role-icon">{{ getRoleIcon(participant.role) }}</span>
              {{ participant.username }}
            </div>
            <div class="participant-status">
              <span class="status-badge" [ngClass]="participant.status.toLowerCase()">
                {{ participant.status }}
              </span>
            </div>
          </div>
          
          <div class="participant-controls">
            <mat-icon *ngIf="participant.audioMuted" class="muted">mic_off</mat-icon>
            <mat-icon *ngIf="participant.videoOff" class="video-off">videocam_off</mat-icon>
            <mat-icon *ngIf="participant.handRaised" class="hand-raised">back_hand</mat-icon>
            <mat-icon *ngIf="participant.inWaitingRoom" class="waiting">schedule</mat-icon>
          </div>
        </div>
        
        <div *ngIf="participants.length === 0" class="no-participants">
          <mat-icon>groups</mat-icon>
          <p>No participants yet</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .participants-dialog {
      width: 400px;
      max-height: 500px;
      background: white;
      border-radius: 12px;
      overflow: hidden;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #e0e0e0;
      background-color: #f5f5f5;

      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }
    }

    .participants-list {
      max-height: 400px;
      overflow-y: auto;
      padding: 16px;
    }

    .participant-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      margin-bottom: 8px;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      transition: background-color 0.2s;

      &.host {
        border-color: #ff9800;
        background-color: #fff3e0;
      }

      &.co_host {
        border-color: #2196f3;
        background-color: #e3f2fd;
      }

      &:hover {
        background-color: #f5f5f5;
      }
    }

    .participant-info {
      flex: 1;

      .participant-name {
        font-weight: 500;
        color: #333;
        margin-bottom: 4px;

        .role-icon {
          margin-right: 8px;
          font-size: 16px;
        }
      }

      .participant-status {
        .status-badge {
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 500;

          &.joined {
            background-color: #e8f5e8;
            color: #4caf50;
          }

          &.waiting {
            background-color: #fff3e0;
            color: #ff9800;
          }

          &.removed {
            background-color: #ffebee;
            color: #f44336;
          }
        }
      }
    }

    .participant-controls {
      display: flex;
      gap: 8px;

      mat-icon {
        font-size: 18px;
        color: #666;

        &.muted {
          color: #f44336;
        }

        &.video-off {
          color: #f44336;
        }

        &.hand-raised {
          color: #ff9800;
        }

        &.waiting {
          color: #ff9800;
        }
      }
    }

    .no-participants {
      text-align: center;
      padding: 40px 20px;
      color: #999;

      mat-icon {
        font-size: 48px;
        margin-bottom: 16px;
        color: #ddd;
      }

      p {
        margin: 0;
        font-size: 16px;
      }
    }
  `]
})
export class ParticipantsComponent implements OnInit, OnDestroy {
  meetingId: string;
  participants: Participant[] = [];
  private stompClient!: Client;
  private subscription?: Subscription;

  constructor(
    private meetingService: MeetingService,
    private dialogRef: MatDialogRef<ParticipantsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { meetingId: string }
  ) {
    this.meetingId = data.meetingId;
  }

  ngOnInit(): void {
    this.loadParticipants();
    this.setupWebSocketConnection();
  }

  private loadParticipants(): void {
    this.meetingService.getParticipants(this.meetingId).subscribe({
      next: (participants) => {
        this.participants = participants;
      },
      error: (err) => console.error('Error loading participants:', err)
    });
  }

  private setupWebSocketConnection(): void {
    this.stompClient = new Client({
      brokerURL: `ws://localhost:8888/ws`,
      reconnectDelay: 5000,
      debug: (str) => console.log('[PARTICIPANTS STOMP]:', str),
      onConnect: () => {
        console.log('✅ STOMP connected for participants');

        this.stompClient.subscribe(`/topic/meeting/${this.meetingId}/participants`, (message: IMessage) => {
          try {
            const update = JSON.parse(message.body);
            this.handleParticipantUpdate(update);
          } catch (err) {
            console.error('Failed to parse participant update', err);
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error', frame);
      }
    });

    this.stompClient.activate();
  }

  private handleParticipantUpdate(update: any): void {
    // Refresh participants list when updates are received
    this.loadParticipants();
  }

  getRoleIcon(role: string): string {
    switch (role.toUpperCase()) {
      case 'HOST':
        return '👑';
      case 'CO_HOST':
        return '🤝';
      case 'PARTICIPANT':
        return '🧑';
      default:
        return '👤';
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    if (this.stompClient && this.stompClient.active) {
      this.stompClient.deactivate();
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}