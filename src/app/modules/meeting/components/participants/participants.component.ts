import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
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
    <div class="meet-sidebar">
      <!-- 🔹 Header -->
      <div class="header">
        <h3>People</h3>
        <button class="close-btn" (click)="close()">✕</button>
      </div>

      <!-- 🔹 Add People button -->
      <div class="add-people">
        <button>
          <mat-icon>person_add</mat-icon>
          Add people
        </button>
      </div>

      <!-- 🔹 Search box -->
      <div class="search-box">
        <input type="text" placeholder="Search for people" />
      </div>

      <!-- 🔹 Section title -->
      <div class="section-title">In the meeting</div>

      <!-- 🔹 Participants list -->
      <div class="participants-list">
        <div class="participant-card" *ngFor="let participant of participants">
          <div class="avatar">{{ participant.username[0] | uppercase }}</div>

          <div class="info">
            <div class="name">{{ participant.username }}</div>
            <div class="role" *ngIf="participant.role">
              {{ participant.role === 'HOST' ? 'Meeting host' : participant.role }}
            </div>
          </div>

          <div class="actions">
            <mat-icon *ngIf="participant.audioMuted">mic_off</mat-icon>
            <mat-icon>more_vert</mat-icon>
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
    .meet-sidebar {
      background: #ffffff;
      width: 100%;
      height: 100%;
      border-radius: 16px; /* ✅ Rounded all 4 corners */
      display: flex;
      flex-direction: column;
      font-family: 'Roboto', sans-serif;
      overflow: hidden;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
      padding: 0;
      position: relative;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 20px;
      border-bottom: 1px solid #e0e0e0;
      font-size: 18px;
      font-weight: 500;
      background-color: #fff;
      border-top-left-radius: 16px;
      border-top-right-radius: 16px;
    }

    .close-btn {
      background: transparent;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #444;
      transition: 0.2s;
    }

    .close-btn:hover {
      color: #000;
    }

    /* Add people */
    .add-people {
      padding: 12px 20px;
      border-bottom: 1px solid #f0f0f0;
    }

    .add-people button {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #e8f0fe;
      border: none;
      padding: 8px 14px;
      border-radius: 24px;
      font-size: 14px;
      color: #1a73e8;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.2s ease;
    }

    .add-people button:hover {
      background: #d2e3fc;
    }

    /* Search box */
    .search-box {
      padding: 10px 20px;
    }

    .search-box input {
      width: 100%;
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid #ccc;
      font-size: 14px;
      outline: none;
    }

    .search-box input:focus {
      border-color: #1a73e8;
    }

    /* Section title */
    .section-title {
      font-size: 12px;
      font-weight: 600;
      color: #555;
      text-transform: uppercase;
      margin: 8px 20px 4px;
    }

    /* Participant list */
    .participants-list {
      flex-grow: 1;
      overflow-y: auto;
      padding: 0 10px 16px;
      background: #fff;
    }

    /* Each participant card */
    .participant-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f8f9fa;
      padding: 8px 10px;
      border-radius: 12px;
      margin: 6px 10px;
      transition: background 0.2s ease, transform 0.1s ease;
    }

    .participant-card:hover {
      background: #f1f3f4;
      transform: scale(1.01);
    }

    .avatar {
      background-color: #1a73e8;
      color: white;
      font-weight: 600;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .info {
      flex-grow: 1;
      margin-left: 10px;
    }

    .name {
      font-size: 14px;
      font-weight: 500;
    }

    .role {
      font-size: 12px;
      color: #666;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .actions mat-icon {
      font-size: 20px;
      color: #666;
      cursor: pointer;
      transition: color 0.2s;
    }

    .actions mat-icon:hover {
      color: #000;
    }

    /* Scrollbar */
    .participants-list::-webkit-scrollbar {
      width: 6px;
    }

    .participants-list::-webkit-scrollbar-thumb {
      background-color: #ccc;
      border-radius: 4px;
    }

    .participants-list::-webkit-scrollbar-thumb:hover {
      background-color: #999;
    }

    .no-participants {
      text-align: center;
      color: #999;
      margin-top: 40px;
    }

    /* ✅ Bottom rounded edges ensured */
    .meet-sidebar::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 16px;
      background: #fff;
      border-bottom-left-radius: 16px;
      border-bottom-right-radius: 16px;
    }
  `]
})
export class ParticipantsComponent implements OnInit, OnDestroy {
  @Input() data!: { meetingId: string };

  meetingId: string = '';
  participants: Participant[] = [];
  private stompClient!: Client;
  private subscription?: Subscription;

  constructor(private meetingService: MeetingService) {}

  ngOnInit(): void {
    this.meetingId = this.data?.meetingId || '';
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
    this.loadParticipants();
  }

  close(): void {
    this.participants = [];
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
