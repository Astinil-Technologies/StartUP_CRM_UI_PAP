import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OnInit } from '@angular/core';
import { ReminderNotifierService } from './reminders/reminder-notifier.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    constructor(private reminderNotifier: ReminderNotifierService) {}
  
    ngOnInit(): void {
      this.reminderNotifier.initReminderPolling(); // Start background reminder checks
    } 
}
