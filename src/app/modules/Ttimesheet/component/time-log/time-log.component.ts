import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/services/authservice/auth.service'; // make sure path is correct

// Updated interface with name
interface DayEntry {
  name: string;
  date: Date;
  hours: number;
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

  // Dropdown selections
  selectedClient: string = '';
  selectedProject: string = '';
  selectedJob: string = '';
  selectedWorkItem: string = '';

  // Dropdown options
  clients: string[] = ['Client A', 'Client B', 'Client C'];
  projects: string[] = ['SWON123', 'Project Y', 'Project Z'];
  jobs: string[] = ['DEVELOPMENT', 'DESIGN', 'TESTING'];
  workItems: string[] = ['WorkItem 1', 'WorkItem 2', 'WorkItem 3'];

  // View and offsets
  view: 'weekly' | 'monthly' = 'weekly';
  weekOffset = 0;
  monthOffset = 0;

  // Entries
  weekDays: DayEntry[] = [];
  monthDays: DayEntry[] = [];

  ngOnInit(): void {
    this.generateWeek();
  }

  setView(view: 'weekly' | 'monthly'): void {
    this.view = view;
    this.weekOffset = 0;
    this.monthOffset = 0;

    if (view === 'weekly') this.generateWeek();
    else this.generateMonth();
  }

  changeOffset(delta: number): void {
    if (this.view === 'weekly') {
      this.weekOffset += delta;
      this.generateWeek();
    } else {
      this.monthOffset += delta;
      this.generateMonth();
    }
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
      return { date, hours: 0, name: dayNames[i] };
    });
  }

  generateMonth(): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + this.monthOffset;
    const totalDays = new Date(year, month + 1, 0).getDate();

    this.monthDays = Array.from({ length: totalDays }, (_, i) => ({
      date: new Date(year, month, i + 1),
      hours: 0,
      name: new Date(year, month, i + 1).toLocaleDateString(undefined, { weekday: 'long' })
    }));
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

  getTotalHours(): number {
    const entries = this.view === 'weekly' ? this.weekDays : this.monthDays;
    return entries.reduce((sum, day) => sum + (day.hours || 0), 0);
  }

  saveDraft(): void {
    const data = this.view === 'weekly' ? this.weekDays : this.monthDays;
    console.log('📝 Draft saved', data);
    alert('Draft saved locally! (not sent to backend)');
  }

  submit(): void {
    if (!this.selectedProject || !this.selectedJob) {
      alert('Please select a project and job!');
      return;
    }

    const isWeekly = this.view === 'weekly';
    const entries = (isWeekly ? this.weekDays : this.monthDays)
      .filter(day => day.hours > 0)
      .map(day => ({
        workDate: day.date.toISOString().split('T')[0],
        hoursWorked: day.hours
      }));

    if (entries.length === 0) {
      alert('No hours entered for submission!');
      return;
    }

    const payload = {
      startDate: (isWeekly ? this.weekDays[0] : this.monthDays[0]).date.toISOString().split('T')[0],
      endDate: (isWeekly
        ? this.weekDays[this.weekDays.length - 1]
        : this.monthDays[this.monthDays.length - 1]).date.toISOString().split('T')[0],
      timesheetType: isWeekly ? 'WEEKLY' : 'MONTHLY',
      job: this.selectedJob.toUpperCase(),
      projectId: this.selectedProject,
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
      },
      error: (err) => {
        console.error('❌ Error submitting timesheet:', err);
        alert('Submission failed. Check console.');
      }
    });
  }
}
