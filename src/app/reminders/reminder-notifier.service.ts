import { Injectable } from '@angular/core';
import { ReminderService } from './reminder.service';
import { Reminder } from '../models/reminder.model';

@Injectable({ providedIn: 'root' })
export class ReminderNotifierService {
  private notifiedIds = new Set<number>();
  private beep = new Audio('assets/success-roll-up-achieve-SBA-300419883.mp3');

  constructor(private reminderService: ReminderService) {}

  initReminderPolling(): void {
    if ('Notification' in window) {
      Notification.requestPermission(); // Ask permission
    }

    setInterval(() => this.checkReminders(), 5000); // Check every 30s
  }

  private checkReminders(): void {
    const now = new Date();

    this.reminderService.getReminders().subscribe(reminders => {
      for (const r of reminders) {
        const due = new Date(r.dueDateTime);
        const notifyAt = new Date(due.getTime() - r.notifyBeforeMinutes * 60000);

        if (
          notifyAt <= now &&
          due >= now &&
          !this.notifiedIds.has(r.id!)
        ) {
          this.notify(r);
          this.notifiedIds.add(r.id!);
        }
      }
    });
  }

  private notify(reminder: Reminder): void {
    if (Notification.permission === 'granted') {
      new Notification('Reminder', {
        body: reminder.title,
        icon: 'assets/reminder-icon.png' // Optional icon
      });
    }

    this.beep.play().catch(err => console.warn('Beep error:', err));
  }
}
