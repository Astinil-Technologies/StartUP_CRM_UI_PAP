import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-reminder-form',
  standalone: true,
  templateUrl: './reminder-form.component.html',
  styleUrls: ['./reminder-form.component.scss'],
  imports: [
  CommonModule,
  FormsModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatButtonModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatCardModule
]
})
export class ReminderFormComponent {
  // ✅ Typed reminder object
  reminder: {
    title?: string;
    notifyBeforeMinutes?: number;
    recurringType?: string | null;
    attachmentPath?: string | null;
  } = {};

  // ✅ Other variables
  isEdit = false;
  dueDate: Date | null = null;
  dueTime: string = '';
  selectedFileName: string | null = null;
  minDate = new Date();

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFileName = file.name;
      this.reminder.attachmentPath = file.name;
    }
  }

  removeAttachment(): void {
    this.selectedFileName = null;
    this.reminder.attachmentPath = null;
  }

  save(): void {
    if (!this.reminder.title || !this.dueDate || !this.dueTime) {
      alert('Please fill all required fields!');
      return;
    }

    const dueDateTime = new Date(this.dueDate);
    const [hours, minutes] = this.dueTime.split(':').map(Number);
    dueDateTime.setHours(hours, minutes);

    const reminderPayload = {
      ...this.reminder,
      dueDateTime,
    };

    console.log('Reminder Saved:', reminderPayload);
    alert(this.isEdit ? 'Reminder updated successfully!' : 'Reminder created successfully!');
  }
}
