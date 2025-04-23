// src/app/home/home.component.ts
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ScheduleMeetingDialogComponent } from '../schedule-meeting-dialog/schedule-meeting-dialog.component';
import VideoCallComponent from "../video-call/video-call.component";
import { ChatComponent } from "../chat/chat.component";


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatDialogModule, ScheduleMeetingDialogComponent, VideoCallComponent, ChatComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  meetingId: string = '';

  constructor(private router: Router, private dialog: MatDialog) {}

  createMeeting(): void {
    const dialogRef = this.dialog.open(ScheduleMeetingDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      const meetingId = Math.random().toString(36).substring(2, 10);
      const meetingLink = `/meet/${meetingId}`;

      if (result.startNow) {
        this.router.navigate([meetingLink]);
      } else {
        const meetingDetails = {
          id: meetingId,
          date: result.meetingDate,
          time: result.meetingTime,
          duration: result.duration,
          link: `${window.location.origin}${meetingLink}`,
        };

        alert(
          `✅ Meeting Scheduled!\n\n📅 Date: ${meetingDetails.date}\n⏰ Time: ${meetingDetails.time}\n⏳ Duration: ${meetingDetails.duration} hour(s)\n🔗 Meeting Link: ${meetingDetails.link}`
        );
      }
    });
  }

  joinMeeting(): void {
    if (!this.meetingId.trim()) {
      alert('Please enter a Meeting ID!');
      return;
    }
    this.router.navigate([`/meet/${this.meetingId}`]);
  }

  showMeeting = true;

closeMeeting() {
  this.showMeeting = false;
}

}
