import { Component, OnInit } from '@angular/core';
import { MeetingService } from 'src/app/core/services/meeting.service';
import { MeetingDto } from 'src/app/models/MeetingDto.model';
import {CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {  Router } from '@angular/router';
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
  private timeSubscription !: Subscription
  constructor(private meetingService: MeetingService,private dialog: MatDialog, private userDataService: UserDataService,private router: Router ) {}

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
      error: (err) => console.error(' Error loading meetings:', err)
    });
  }

  private parseDateSafely(value: string | Date | undefined): Date | undefined {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    const fixed = value.includes(' ') ? value.replace(' ', 'T') : value;
    const parsedDate = new Date(fixed);
    return isNaN(parsedDate.getTime()) ? undefined : parsedDate;
  }
  private updateDateTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.currentDate = now.toDateString();
  }

  onCreateMeeting() {
  const generatedMeetingId = Math.floor(100000 + Math.random() * 900000).toString();
    this.router.navigate(['/layout/meet', generatedMeetingId]);

  }

  onJoinMeeting() {
    console.log("Join meeting");
  }

  onScheduleMeeting() {
      this.dialog.open(ScheduleMeetingComponent, {
      width: '500px',
      disableClose: true
    });
  }

  onShareScreen() {
    console.log("Share screen");
  }
}