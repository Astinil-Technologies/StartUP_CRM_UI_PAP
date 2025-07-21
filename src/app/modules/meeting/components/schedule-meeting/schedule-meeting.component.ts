import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MeetingService } from 'src/app/core/services/meeting.service';
import { MeetingDto } from 'src/app/models/MeetingDto.model';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
@Component({
  selector: 'app-schedule-meeting',
  standalone: true,
  templateUrl: './schedule-meeting.component.html',
  styleUrls: ['./schedule-meeting.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,  MatDatepickerModule,
  MatNativeDateModule
  ],
})
export class ScheduleMeetingComponent {
  meetingForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private meetingService: MeetingService,
    public dialogRef: MatDialogRef<ScheduleMeetingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.meetingForm = this.fb.group({
      title: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      hostId: [1, Validators.required],
      lobbyEnabled: [true],
    });
  }

  onSubmit() {
    if (this.meetingForm.valid) {
      const meeting: MeetingDto = this.meetingForm.value;

      this.meetingService.createMeeting(meeting).subscribe({
        next: (createdMeeting) => {
          alert('Meeting scheduled successfully!');
          console.log('Scheduled Meeting:', createdMeeting);
          this.dialogRef.close(); // close after success
        },
        error: (err) => {
          console.error('Scheduling error:', err);
          alert('Error scheduling meeting.');
        },
      });
    }
  }
  onClose() {
    this.dialogRef.close();
  }
}
 