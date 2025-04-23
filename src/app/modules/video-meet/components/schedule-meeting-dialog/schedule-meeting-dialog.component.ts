import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-schedule-meeting-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatDialogModule
  ],
  templateUrl: './schedule-meeting-dialog.component.html',
  styleUrls: ['./schedule-meeting-dialog.component.css']
})
export class ScheduleMeetingDialogComponent {
  meetingDate: Date = new Date();
  meetingTime: string = this.getCurrentTime();
  meetingDuration: number = 1;
  startNow: boolean = false;
  minDate: Date = new Date(); // Prevent past dates

  constructor(public dialogRef: MatDialogRef<ScheduleMeetingDialogComponent>) {}

  getCurrentTime(): string {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // HH:MM
  }

  get currentDateTime(): string {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().slice(0, 5);
    return `${date} ${time}`;
  }

  onDateChange(event: any) {
    this.meetingDate = event;
    console.log('📅 Date changed:', this.meetingDate);
  }

  scheduleMeeting() {
    const dateStr = this.meetingDate.toISOString().split('T')[0];

    const meetingDetails = {
      meetingDate: dateStr,
      meetingTime: this.meetingTime,
      duration: this.meetingDuration,
      startNow: this.startNow
    };

    this.dialogRef.close(meetingDetails); // Pass to parent
  }

  cancel() {
    this.dialogRef.close();
  }
}
