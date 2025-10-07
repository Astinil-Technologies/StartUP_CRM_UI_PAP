import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/services/authservice/auth.service';

interface DayEntry {
  name: string;
  date: Date;
  hours: number | null;
  disabled: boolean;
  formattedDate: string;
  isSubmitted: boolean;
}

@Component({
  selector: 'app-time-log',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './time-log.component.html',
  styleUrls: ['./time-log.component.scss'],
})
export class TimeLogComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  selectedClient: string = '';
  selectedProject: string = '';
  selectedJob: string = '';
  selectedWorkItem: string = '';

  clients: string[] = ['Client A', 'Client B', 'Client C'];
  projects: string[] = ['SWON123', 'Project Y', 'Project Z'];
  jobs: string[] = ['DEVELOPMENT', 'DESIGN', 'TESTING'];
  workItems: string[] = ['WorkItem 1', 'WorkItem 2', 'WorkItem 3'];

  view: 'weekly' | 'monthly' = 'weekly';
  weekOffset = 0;
  monthOffset = 0;

  weekDays: DayEntry[] = [];
  monthDays: DayEntry[] = [];
  isTimesheetSubmitted: boolean = false;

  ngOnInit(): void {
    this.generateWeek();
    this.generateMonth();
    this.checkTimesheetSubmission();
  }

  setView(view: 'weekly' | 'monthly'): void {
    this.view = view;
    this.weekOffset = 0;
    this.monthOffset = 0;
    if (view === 'weekly') {
      this.generateWeek();
    } else {
      this.generateMonth();
    }
    this.checkTimesheetSubmission();
  }

  changeOffset(delta: number): void {
    if (this.view === 'weekly') {
      this.weekOffset += delta;
      this.generateWeek();
    } else {
      this.monthOffset += delta;
      this.generateMonth();
    }
    this.checkTimesheetSubmission();
  }

  generateWeek(): void {
    const today = new Date();
    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Monday start
    startOfWeek.setDate(today.getDate() + diff + this.weekOffset * 7);

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    this.weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return { 
        date, 
        hours: null,
        name: dayNames[i], 
        disabled: false,
        isSubmitted: false,
        formattedDate: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      };
    });

    this.fetchTimesheetHistoryForRange(this.weekDays[0].date, this.weekDays[6].date);
  }

  generateMonth(): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + this.monthOffset;
    const totalDays = new Date(year, month + 1, 0).getDate();

    this.monthDays = Array.from({ length: totalDays }, (_, i) => {
      const date = new Date(year, month, i + 1);
      return {
        date,
        hours: null,
        name: date.toLocaleDateString(undefined, { weekday: 'long' }),
        disabled: false,
        isSubmitted: false,
        formattedDate: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      };
    });

    this.fetchTimesheetHistoryForRange(this.monthDays[0].date, this.monthDays[this.monthDays.length - 1].date);
  }

  fetchTimesheetHistoryForRange(startDate: Date, endDate: Date): void {
    const token: string = this.authService.getAccessToken() as string;
    if (!token) {
      alert('You are not authenticated!');
      return;
    }

    this.http.get(`http://localhost:8888/timesheet/history`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response: any) => {
        const allTimesheets = response?.data || [];

        // Flatten all entries from all timesheets in the range
        const entriesInRange = allTimesheets.flatMap((ts: any) => 
          ts.entries?.filter((entry: any) => {
            const entryDate = new Date(entry.workDate);
            return entryDate >= startDate && entryDate <= endDate;
          }) || []
        );

        // Decide which array to update based on view & update days accordingly
        const targetDays = this.view === 'weekly' ? this.weekDays : this.monthDays;

        targetDays.forEach(day => {
          const match = entriesInRange.find((e: any) =>
            e.workDate === day.date.toISOString().split('T')[0]
          );
          if (match) {
            day.hours = match.hoursWorked;
            day.disabled = true;
            day.isSubmitted = true;
          } else {
            day.hours = null;
            day.disabled = false;
            day.isSubmitted = false;
          }
        });

        // Update timesheet submission flag
        this.isTimesheetSubmitted = entriesInRange.length > 0;
      },
      error: (err) => {
        console.error('Error fetching timesheet history:', err);
        alert('Error fetching timesheet history!');
      }
    });
  }

  getTotalHours(): number {
    const entries = this.view === 'weekly' ? this.weekDays : this.monthDays;
    return entries.reduce((sum, day) => sum + (day.hours || 0), 0);
  }

  getCurrentRange(): string {
    if (this.view === 'weekly') {
      const start = this.weekDays[0]?.date;
      const end = this.weekDays[6]?.date;
      if (!start || !end) return '';
      const options = { month: 'short', day: 'numeric' } as const;
      return `${start.toLocaleDateString(undefined, options)} - ${end.toLocaleDateString(undefined, options)}`;
    } else {
      const firstDay = this.monthDays[0]?.date;
      if (!firstDay) return '';
      const options = { month: 'long', year: 'numeric' } as const;
      return firstDay.toLocaleDateString(undefined, options);
    }
  }

  checkTimesheetSubmission(): void {
    // Already handled by fetchTimesheetHistoryForRange inside generateWeek/Month
    // So no separate backend call needed here
  }

  saveDraft(): void {
    const data = this.view === 'weekly' ? this.weekDays : this.monthDays;
    console.log('📝 Draft saved', data);
    alert('Draft saved locally! (not sent to backend)');
  }

  submit(): void {
    if (!this.selectedProject || !this.selectedJob || !this.selectedWorkItem) {
      alert('Please select a project, job, and work item!');
      return;
    }

    const entries = (this.view === 'weekly' ? this.weekDays : this.monthDays)
      .filter(day => day.hours !== null && day.hours > 0 && !day.disabled && !day.isSubmitted)
      .map(day => ({
        workDate: day.date.toISOString().split('T')[0],
        hoursWorked: day.hours
      }));

    if (entries.length === 0) {
      alert('No hours entered for submission!');
      return;
    }

    const payload = {
      startDate: (this.view === 'weekly' ? this.weekDays[0] : this.monthDays[0]).date.toISOString().split('T')[0],
      endDate: (this.view === 'weekly'
        ? this.weekDays[this.weekDays.length - 1]
        : this.monthDays[this.monthDays.length - 1]).date.toISOString().split('T')[0],
      timesheetType: this.view === 'weekly' ? 'WEEKLY' : 'MONTHLY',
      job: this.selectedJob.toUpperCase(),
      projectId: this.selectedProject,
      workItem: this.selectedWorkItem,
      entries
    };

    const token: string = this.authService.getAccessToken() as string;
    if (!token) {
      alert('You are not authenticated!');
      return;
    }

    this.http.post('http://localhost:8888/timesheet/log', payload, {
      headers: { Authorization: `Bearer ${token}` },
    }).subscribe({
      next: (data) => {
        console.log('✅ Response:', data);
        alert('Timesheet submitted successfully!');
        this.isTimesheetSubmitted = true;

        // Sync the data from weekly to monthly or vice versa
        if (this.view === 'weekly') {
          this.syncEntriesToMonthly(entries);
        } else {
          this.syncEntriesToWeekly(entries);
        }
      },
      error: (err) => {
        console.error('❌ Error submitting timesheet:', err);
        alert('Submission failed. Check console.');
      }
    });
  }

  syncEntriesToMonthly(entries: any[]): void {
    entries.forEach(entry => {
      const matchingDay = this.monthDays.find(day => day.date.toISOString().split('T')[0] === entry.workDate);
      if (matchingDay) {
        matchingDay.hours = entry.hoursWorked;
        matchingDay.disabled = true;
        matchingDay.isSubmitted = true;
      }
    });
  }

  syncEntriesToWeekly(entries: any[]): void {
    entries.forEach(entry => {
      const matchingDay = this.weekDays.find(day => day.date.toISOString().split('T')[0] === entry.workDate);
      if (matchingDay) {
        matchingDay.hours = entry.hoursWorked;
        matchingDay.disabled = true;
        matchingDay.isSubmitted = true;
      }
    });
  }
}
