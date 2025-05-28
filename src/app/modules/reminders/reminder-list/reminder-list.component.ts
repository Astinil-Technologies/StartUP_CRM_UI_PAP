import { Component,OnInit } from '@angular/core';
import { ReminderService } from '../reminder.service';
import { Reminder } from 'src/app/models/reminder.model';
import { SnackbarService } from 'src/app/shared/snackbar.service';
import { Observable } from 'rxjs';
import { Router,RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-reminder-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, 
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './reminder-list.component.html',
  styleUrl: './reminder-list.component.scss'
})
export class ReminderListComponent {
  reminders: Reminder[] = [];

  constructor(
    private reminderService: ReminderService,
    private router: Router,
    private snackbar: SnackbarService
  ) {}

  ngOnInit(): void {
    this.loadReminders();
  }

  loadReminders(): void {
    this.reminderService.getReminders().subscribe(data => {
      this.reminders = data;
    });
  }

  editReminder(id: number): void {
    this.router.navigate(['/layout/reminders', id, 'edit']);
  }

  deleteReminder(id: number): void {
    if (confirm('Are you sure to delete this reminder?')) {
      this.reminderService.deleteReminder(id).subscribe(() => {
        this.snackbar.show('Reminder deleted');
        this.loadReminders();
      });
    }
  }
downloadAttachment(path: string): void {
  // Extract filename from full path
  const fileName = path.split('/').pop()!;
  const baseUrl = environment.baseUrl; 
  const url = `${baseUrl}/api/attachments/download/${encodeURIComponent(fileName)}`;
  window.open(url, '_blank');
}
}
