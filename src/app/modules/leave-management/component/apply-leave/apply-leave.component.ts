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

  constructor(private fb: FormBuilder, private leaveService: LeaveService) {}

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

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.attachmentFile = event.target.files[0];
      this.leaveForm.patchValue({ attachment: this.attachmentFile });
    }
  }

  submitLeave() {
  if (this.leaveForm.invalid) {
    alert('Please fill all required fields.');
    return;
  }

  const payload = {
    leaveType: this.leaveForm.value.leaveType,
    startDate: this.leaveForm.value.startDate,
    isHalfDay: this.leaveForm.value.leaveDuration === 'HALF_TIME',
    endDate: this.leaveForm.value.endDate,
    reason: this.leaveForm.value.reason
  };

  this.leaveService.applyLeave(payload).subscribe({
    next: (res: any) => {
      alert('Leave applied successfully!');
      this.leaveForm.reset();
    },
    error: (err: any) => {
      console.error(err);
      alert(err.error?.message || 'Failed to submit leave');
    }
  });
}


  cancelLeave() {
    this.leaveForm.reset();
    this.attachmentFile = null;
  }
}
