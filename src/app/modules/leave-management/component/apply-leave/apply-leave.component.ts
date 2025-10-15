import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-apply-leave',
  templateUrl: './apply-leave.component.html',
  styleUrls: ['./apply-leave.component.scss']
})
export class ApplyLeaveComponent implements OnInit {
  leaveForm!: FormGroup;
  attachmentFile: File | null = null;

  leaveTypes = [
    'Sick Leave',
    'Casual Leave',
    'Earned Leave',
    'Maternity Leave',
    'Paternity Leave'
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.leaveForm = this.fb.group({
      leaveType: ['', Validators.required],
      startDate: ['', Validators.required],
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
    if (this.leaveForm.valid) {
      const formData = new FormData();
      formData.append('leaveType', this.leaveForm.value.leaveType);
      formData.append('startDate', this.leaveForm.value.startDate);
      formData.append('endDate', this.leaveForm.value.endDate);
      formData.append('reason', this.leaveForm.value.reason);

      if (this.attachmentFile) {
        formData.append('attachment', this.attachmentFile);
      }

      console.log('Form Data Submitted:', this.leaveForm.value);
      alert('Leave request submitted successfully!');
      this.leaveForm.reset();
      this.attachmentFile = null;
    } else {
      alert('Please fill all required fields.');
    }
  }

  cancelLeave() {
    this.leaveForm.reset();
    this.attachmentFile = null;
  }
}
