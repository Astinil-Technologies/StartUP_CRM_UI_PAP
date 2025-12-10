import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TimesheetService } from 'src/app/core/services/timesheet/timesheet.service';
import { UserService } from 'src/app/core/services/userservice/user.service';
import { LeaveService } from 'src/app/core/services/leave/leave.service';
import { TimesheetRequest } from 'src/app/models/timesheet-request.model';
import { User } from 'src/app/models/user.model';
import Holidays from 'date-holidays';


@Component({
  selector: 'app-timesheet-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './timesheet-home.component.html',
  styleUrls: ['./timesheet-home.component.scss'],   // <-- FIXED
})

export class TimesheetHomeComponent implements OnInit {

  currentUser: User | null = null;
  userId = '';
  username = '';

  today: Date = new Date();
  currentTime: string = '';

  displayedDate: Date = new Date();

  selectedDate: Date | null = null;
  showModal = false;

  workDone = '';
  blockers = '';
  plans = '';
  submittedDates: Set<string> = new Set();

  months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  years: number[] = [];
  selectedMonth: number = new Date().getMonth();
  selectedYear: number = new Date().getFullYear();

  weekDays: string[] = [
    'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'
  ];

  holidays: any[] = [];
  leavesInMonth: any[] = [];

  calendarTable: any[][] = [];

  constructor(
    private timesheetService: TimesheetService,
    private userService: UserService,
    private leaveService: LeaveService
  ) {}

  ngOnInit(): void {
    this.generateYearRange();
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);

    this.userService.getUserProfile().subscribe({
      next: (user) => {
        if (user) {
          this.currentUser = user;
          this.userId = user.id.toString();
          this.username = `${user.firstName} ${user.lastName}`;

          this.onMonthOrYearChange();
        }
      }
    });
  }
loadIndianHolidays() {
  const hdAP = new Holidays('IN', 'AP');  // AP state holidays
  const hdTS = new Holidays('IN', 'TS');  // Telangana state holidays

  const apHolidays = hdAP.getHolidays(this.selectedYear);
  const tsHolidays = hdTS.getHolidays(this.selectedYear);

  const merged = [...apHolidays, ...tsHolidays];

  this.holidays = merged.map((h: any) => ({
    date: h.date.substring(0, 10),
    name: h.name
  }));

  console.table(this.holidays);
}




  // ---------------- TIME -------------------
  updateTime() {
    this.currentTime = new Date().toLocaleTimeString();
  }

  // ---------------- YEAR RANGE -------------------
  generateYearRange() {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      this.years.push(i);
    }
  }

  // ---------------- LOAD DATA FROM BACKEND -------------------
loadCalendarData() {
  const id = Number(this.userId);

  this.leaveService.getEmployeeCalendar(id).subscribe({
    next: (response) => {
      console.log("Calendar API Response:", response);

      // Merge backend holidays + existing national holidays
      const backendHolidays = response.holidays || [];

      this.holidays = [
        ...backendHolidays.map((h: any) => ({
          date: h.date.substring(0, 10),
          name: h.name
        })),
        ...this.holidays   // keep local AP/TS/IN holidays
      ];

      // Keep only APPROVED leaves
      this.leavesInMonth = (response.leaves || []).filter(
        (l: any) => l.status === 'APPROVED'
      );

      this.generateCalendar();
    },
    error: (err) => console.error('Calendar load error:', err)
  });
}




  // ---------------- GENERATE CALENDAR -------------------
  generateCalendar() {
    const start = new Date(this.selectedYear, this.selectedMonth, 1);
    const startDay = start.getDay();

    this.calendarTable = [];
    const currentMonth = start.getMonth();

    let currentDate = new Date(start);
    currentDate.setDate(currentDate.getDate() - startDay);

    for (let week = 0; week < 6; week++) {
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
          weekRow.push(null);
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }

        if (isYesterday) { disabled = true; message = 'This is expired.'; }
        else if (isTomorrow) { disabled = true; message = 'Not allowed for tomorrow.'; }
        else if (isWeekend) { disabled = true; message = 'Weekend!'; }
        else if (!isToday || !this.isCurrentMonthYearDisplayed()) {
          disabled = true; message = "Only today's entry allowed.";
        }
        else if (this.submittedDates.has(this.formatDate(date))) {
          disabled = true; message = 'Already submitted.';
        }

        // BACKEND HOLIDAY / LEAVE MATCH
        const formatted = this.formatDate(date);
const holiday = this.holidays.find(h =>
  this.formatDate(new Date(h.date)) === formatted
);

const leave = this.leavesInMonth.find(l =>
  l.status === 'APPROVED' &&
  formatted >= l.startDate &&
  formatted <= l.endDate
);

        weekRow.push({
          date,
          isToday,
          isWeekend,
          isYesterday,
          isTomorrow,
          disabled,
          message,
          holiday,
          leave
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }
      this.calendarTable.push(weekRow);
    }
  }

  isSameDate(a: Date, b: Date): boolean {
    return (
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear()
    );
  }

  addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}

  isCurrentMonthYearDisplayed(): boolean {
    const now = new Date();
    return this.selectedMonth === now.getMonth() &&
           this.selectedYear === now.getFullYear();
  }

  // ---------------- MONTH CHANGE -------------------
  onMonthOrYearChange() {
  this.displayedDate = new Date(this.selectedYear, this.selectedMonth, 1);

  this.loadIndianHolidays();   // 1. load holidays first
  this.loadCalendarData();     // 2. load leaves + generate calendar
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

  // ---------------- DATE CLICK -------------------
  onDateClick(dayObj: any) {
    if (!dayObj.disabled && dayObj.isToday) {
      this.selectedDate = dayObj.date;
      this.showModal = true;
    }
  }

  // ---------------- SUBMIT TIMESHEET -------------------
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
      }
    });
  }

  clearForm() {
    this.workDone = '';
    this.blockers = '';
    this.plans = '';
  }
}
