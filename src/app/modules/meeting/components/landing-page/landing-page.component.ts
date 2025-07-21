import { Component, OnInit } from '@angular/core';
import { MeetingService } from 'src/app/core/services/meeting.service';
import { MeetingDto } from 'src/app/models/MeetingDto.model';
import {CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog,MatDialogModule } from '@angular/material/dialog';
import { ScheduleMeetingComponent } from '../schedule-meeting/schedule-meeting.component';
import { UserDataService } from 'src/app/core/services/user-data.service';
import { Subscription, interval } from 'rxjs';
@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, DatePipe, MatIconModule,MatDialogModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  currentTime: string = '';
  currentDate: string = '';
  todayMeetings: MeetingDto[] = [];
   private timeSubscription!: Subscription;
  constructor(private meetingService: MeetingService,private dialog: MatDialog, private userDataService: UserDataService) {}

   ngOnInit(): void {
    this.updateDateTime();
    this.timeSubscription = interval(1000).subscribe(() => this.updateDateTime());

    const user = this.userDataService.getCurrentUserData();
    const userId = user?.id;

    if (!userId) {
      console.error("⚠️ User not logged in or ID not found");
      return;
    }
    this.meetingService.getUpcomingMeetings(Number(userId)).subscribe({
      next: (res) => {
        const today = new Date();
        const todayYear = today.getFullYear();
        const todayMonth = today.getMonth();
        const todayDate = today.getDate();
        this.todayMeetings = res
          .map(meeting => ({
            ...meeting,
            startTime: this.parseDateSafely(meeting.startTime),
          }))
          .filter(meeting => {
            const start = meeting.startTime;
            return (
              start instanceof Date &&
              start.getFullYear() === todayYear &&
              start.getMonth() === todayMonth &&
              start.getDate() === todayDate
            );
          })
          .sort((a, b) => (a.startTime?.getTime() ?? 0) - (b.startTime?.getTime() ?? 0));
      },
      error: (err) => console.error('❌ Error loading meetings:', err)
    });
  }

  // ✅ Safe Date parsing with patch fallback
  private parseDateSafely(value: string | Date | undefined): Date | undefined {
    if (!value) return undefined;

    if (value instanceof Date) return value;
    const fixed = value.includes(' ') ? value.replace(' ', 'T') : value;
    const parsed = new Date(fixed);
    // let patched = value;

    // // Convert "2025-07-15 15:30:00" → "2025-07-15T15:30:00"
    // if (patched.includes(' ') && !patched.includes('T')) {
    //   patched = patched.replace(' ', 'T');
    // }

    // // Add 'Z' to ensure UTC if no timezone offset is present
    // // if (!patched.endsWith('Z') && !patched.includes('+')) {
    // //   patched += 'Z';
    // // }

    // const parsedDate = new Date(patched);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }
   private updateDateTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.currentDate = now.toDateString();
  }
  onCreateMeeting() {
    console.log("Create meeting");
  }

  onJoinMeeting() {
    console.log("Join meeting");
  }

  onScheduleMeeting() {
     console.log("Schedule meeting");
    this.dialog.open(ScheduleMeetingComponent, {
      width: '500px',
      disableClose: true
    });
    console.log("Schedule meeting");
  }

  onShareScreen() {
    console.log("Share screen");
  }
}