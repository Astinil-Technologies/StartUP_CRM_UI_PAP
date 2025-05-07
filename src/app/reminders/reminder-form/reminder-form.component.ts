import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReminderService } from '../reminder.service';
import { Reminder } from 'src/app/models/reminder.model';
import { SnackbarService } from 'src/app/shared/snackbar.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
@Component({
  selector: 'app-reminder-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,MatCardModule
  ],
  templateUrl: './reminder-form.component.html',
  styleUrl: './reminder-form.component.scss'
})
export class ReminderFormComponent implements OnInit {
  reminder: Reminder = {
    title: '',
    dueDateTime: new Date(),
    notifyBeforeMinutes: 10
  };

  dueDate!: Date;
  dueTime!: string;

  minDate!: Date;
  minTime!: string;

  isEdit = false;
  reminderId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reminderService: ReminderService,
    private snackbar: SnackbarService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Set minimum date to today and minimum time to now + 5 minutes
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);

    this.minDate = new Date(now);

    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.minTime = `${hours}:${minutes}`;

    this.reminderId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.reminderId) {
      this.isEdit = true;
      this.reminderService.getReminders().subscribe(reminders => {
        const found = reminders.find(r => r.id === this.reminderId);
        if (found) {
          this.reminder = found;

          const dueDateTime = new Date(found.dueDateTime);
          this.dueDate = new Date(
            dueDateTime.getFullYear(),
            dueDateTime.getMonth(),
            dueDateTime.getDate()
          );

          const h = dueDateTime.getHours().toString().padStart(2, '0');
          const m = dueDateTime.getMinutes().toString().padStart(2, '0');
          this.dueTime = `${h}:${m}`;
        }
      });
    }
  }

  save(): void {
    if (!this.dueDate || !this.dueTime) return;

    const [hour, minute] = this.dueTime.split(':').map(Number);
    const combinedDateTime = new Date(
      this.dueDate.getFullYear(),
      this.dueDate.getMonth(),
      this.dueDate.getDate(),
      hour,
      minute,
      0
    );

    // Remove timezone offset to preserve exact local time
    this.reminder.dueDateTime = new Date(combinedDateTime.getTime() - combinedDateTime.getTimezoneOffset() * 60000);

    const saveObservable = this.isEdit
      ? this.reminderService.updateReminder(this.reminderId!, this.reminder)
      : this.reminderService.createReminder(this.reminder);

    saveObservable.subscribe(() => {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: { message: `Reminder ${this.isEdit ? 'updated' : 'created'} successfully.` }
      });

      dialogRef.afterClosed().subscribe(() => {
        this.router.navigate(['/layout/reminders']);
      });
    });
  }
}
