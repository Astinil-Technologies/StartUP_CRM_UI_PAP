import { Component, OnInit } from '@angular/core';
import { MeetingService } from 'src/app/core/services/meeting.service';
import { MeetingDto } from 'src/app/models/MeetingDto.model';
import {CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, DatePipe, MatIconModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  currentTime: string = '';
  currentDate: string = '';
  todayMeetings: MeetingDto[] = [];

  constructor(private meetingService: MeetingService) {}

  ngOnInit(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.currentDate = now.toDateString();

    const userId = Number(localStorage.getItem('userId') || '0');

    this.meetingService.getUpcomingMeetings(userId).subscribe({
      next: (res) => {
        const today = new Date().toDateString();

        this.todayMeetings = res
          .filter(meeting => {
            const parsed = this.parseDateSafely(meeting.startTime);
            return parsed?.toDateString() === today;
          })
          .map(meeting => ({
            ...meeting,
            startTime: this.parseDateSafely(meeting.startTime),
          }));
      },
      error: (err) => console.error('Error loading meetings', err)
    });
  }

  // ✅ Safe Date parsing with patch fallback
  private parseDateSafely(value: string | Date | undefined): Date | undefined {
    if (!value) return undefined;

    if (value instanceof Date) return value;

    let patched = value;

    // Convert "2025-07-15 15:30:00" → "2025-07-15T15:30:00"
    if (patched.includes(' ') && !patched.includes('T')) {
      patched = patched.replace(' ', 'T');
    }

    // Add 'Z' to ensure UTC if no timezone offset is present
    if (!patched.endsWith('Z') && !patched.includes('+')) {
      patched += 'Z';
    }

    const parsedDate = new Date(patched);
    return isNaN(parsedDate.getTime()) ? undefined : parsedDate;
  }

  onCreateMeeting() {
    console.log("Create meeting");
  }

  onJoinMeeting() {
    console.log("Join meeting");
  }

  onScheduleMeeting() {
    console.log("Schedule meeting");
  }

  onShareScreen() {
    console.log("Share screen");
  }
}