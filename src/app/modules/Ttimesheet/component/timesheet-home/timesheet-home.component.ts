import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TimesheetService } from 'src/app/core/services/timesheet/timesheet.service';
import { UserService } from 'src/app/core/services/userservice/user.service';
import { TimesheetRequest } from 'src/app/models/timesheet-request.model';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-timesheet-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './timesheet-home.component.html',
  styleUrl: './timesheet-home.component.scss',
})
export class TimesheetHomeComponent implements OnInit {
  currentUser: User | null = null;
  userId = '';
  username = '';
  today: Date = new Date(); // Real today's date
  currentTime: string = '';
  calendarDates: {
    date: Date;
    isToday: boolean;
    isWeekend: boolean;
    isYesterday: boolean;
    isTomorrow: boolean;
    disabled: boolean;
    message?: string;
  }[] = [];

  selectedDate: Date | null = null;
  showModal = false;
  workDone = '';
  blockers = '';
  plans = '';
  submittedDates: Set<string> = new Set();

  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  years: number[] = [];

  selectedMonth: number = new Date().getMonth();
  selectedYear: number = new Date().getFullYear();

  constructor(
    private timesheetService: TimesheetService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.generateYearRange();
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
    this.generateCalendar();

    this.userService.getUserProfile().subscribe({
      next: (user) => {
        if (user) {
          this.currentUser = user;
          this.userId = user.id.toString();
          this.username = user.firstName + ' ' + user.lastName;
        } else {
          console.warn('No user data available.');
        }
      },
      error: (err) => {
        console.error('Failed to fetch user profile', err);
      },
    });
  }

  updateTime() {
    this.currentTime = new Date().toLocaleTimeString();
  }

  weekDays: string[] = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  calendarTable: any[][] = [];

  generateCalendar() {
    const start = new Date(this.selectedYear, this.selectedMonth, 1); // use selected month
    const startDay = start.getDay(); // get weekday of 1st date

    this.calendarDates = [];
    this.calendarTable = [];

    const currentMonth = start.getMonth();
    let currentDate = new Date(start);
    currentDate.setDate(currentDate.getDate() - startDay); // go back to start of week

    for (let week = 0; week < 5; week++) {
      const weekRow: any[] = [];

      for (let day = 0; day < 7; day++) {
        const date = new Date(currentDate);
        const isToday = this.isSameDate(date, this.today);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const isYesterday = this.isSameDate(date, this.addDays(this.today, -1));
        const isTomorrow = this.isSameDate(date, this.addDays(this.today, 1));

        let disabled = false;
        let message = '';

        if (date.getMonth() !== currentMonth) {
          weekRow.push(null); // empty cell
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }

        if (isYesterday) {
          disabled = true;
          message = 'This is expired.';
        } else if (isTomorrow) {
          disabled = true;
          message = 'Not allowed. This is for tomorrow’s update.';
        } else if (isWeekend) {
          disabled = true;
          message = 'It’s a weekend. Enjoy your weekend!';
        } else if (!isToday || !this.isCurrentMonthYearDisplayed()) {
          disabled = true;
          message = "Only today's entry is allowed.";
        } else if (this.submittedDates.has(this.formatDate(date))) {
          disabled = true;
          message = 'Already submitted.';
        }

        weekRow.push({
          date,
          isToday,
          isWeekend,
          isYesterday,
          isTomorrow,
          disabled,
          message,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      this.calendarTable.push(weekRow);
    }
  }

  isSameDate(d1: Date, d2: Date): boolean {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  }

  isCurrentMonthYearDisplayed(): boolean {
    const now = new Date();
    return this.selectedMonth === now.getMonth() &&
           this.selectedYear === now.getFullYear();
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // yyyy-mm-dd
  }

  addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  onDateClick(dateObj: any) {
    if (!dateObj.disabled && dateObj.isToday) {
      this.selectedDate = dateObj.date;
      this.showModal = true;
    }
  }

  submitTimesheet() {
    const payload: TimesheetRequest = {
      userId: this.userId,
      username: this.username,
      workDone: this.workDone,
      blockers: this.blockers,
      tasksForTomorrow: this.plans,
    };

    this.timesheetService.submitTimesheet(payload).subscribe({
      next: (response: string) => {
        alert(response);
        this.showModal = false;
        this.clearForm();
        this.submittedDates.add(this.formatDate(this.today));
        this.generateCalendar();
      },
      error: (err) => {
        console.error(err);
        alert('Failed to submit timesheet.');
      },
    });
  }

  clearForm() {
    this.workDone = '';
    this.blockers = '';
    this.plans = '';
  }

  goToPreviousMonth() {
    if (this.selectedMonth === 0) {
      this.selectedMonth = 11;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }
    this.onMonthOrYearChange();
  }

  goToNextMonth() {
    if (this.selectedMonth === 11) {
      this.selectedMonth = 0;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }
    this.onMonthOrYearChange();
  }

  generateYearRange() {
    const currentYear = new Date().getFullYear();
    const range = 10;
    for (let i = currentYear - range; i <= currentYear + range; i++) {
      this.years.push(i);
    }
  }

  onMonthOrYearChange() {
    this.generateCalendar(); // Keep real today
  }
}
