import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LeaveService } from 'src/app/core/services/leave/leave.service';



@Component({
  selector: 'app-apply-leave',
  standalone: true,
  templateUrl: './apply-leave.component.html',
  styleUrls: ['./apply-leave.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class ApplyLeaveComponent implements OnInit {

  leaveForm!: FormGroup;
  // keep attachmentFile if you want the input visible but backend doesn't use it yet
  attachmentFile: File | null = null;

  // Must match backend enums
 leaveTypes: string[] = [
  'SICK',
  'CASUAL',
  'EARNED',
  'UNPAID',
  'MATERNITY',
  'PATERNITY'
];
 leaveDurationTypes: string[] = ['HALF_TIME', 'FULL_TIME'];

  constructor(
    private fb: FormBuilder,
    private leaveService: LeaveService
  ) {}

  ngOnInit(): void {
    this.leaveForm = this.fb.group({
      leaveType: ['', Validators.required],
      startDate: ['', Validators.required],
      leaveDuration: ['', Validators.required],
      endDate: ['', Validators.required],
      reason: ['', Validators.required],
      attachment: [null]
    });
  }

  // ------------------ FILE UPLOAD ------------------
  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.attachmentFile = event.target.files[0];
      this.leaveForm.patchValue({ attachment: this.attachmentFile });
    }
  }

  // ------------------ SUBMIT LEAVE FORM ------------------
submitLeave()             {

  if (this.leaveForm.invalid) {
    alert("Please fill all required fields.");
    return;
  }

  const formData = new FormData();
  formData.append('leaveType', this.leaveForm.value.leaveType);
  formData.append('startDate', this.leaveForm.value.startDate);
  formData.append('endDate', this.leaveForm.value.endDate);
  formData.append('reason', this.leaveForm.value.reason);
  
  formData.append('userId', localStorage.getItem("userId") || '');

  if (this.attachmentFile) {
    formData.append('attachment', this.attachmentFile);
  }

  this.leaveService.applyLeave(formData).subscribe({
    next: () => {
      alert("Leave request submitted successfully!");

      // when user comes back to timesheet → refresh calendar
      localStorage.setItem("refreshCalendar", "true");

      this.leaveForm.reset();
      this.attachmentFile = null;
    },
    error: (err) => {
      console.error(err);
      alert("Failed to submit leave.");
    }
  });
}


  // ------------------ CANCEL FORM ------------------
  cancelLeave() {
    this.leaveForm.reset();
    this.attachmentFile = null;
  }
}
