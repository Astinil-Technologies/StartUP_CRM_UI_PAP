import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/core/services/authservice/auth.service';
import { TimesheetService } from 'src/app/core/services/timesheet/timesheet.service';
import { jwtDecode } from "jwt-decode";
interface DayEntry {
  name: string;
  date: Date;
  hours: number | string;
  editable: boolean;
}

@Component({
  selector: 'app-time-log',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './time-log.component.html',
  styleUrls: ['./time-log.component.scss'],
})
export class TimeLogComponent implements OnInit {
  private authService = inject(AuthService);
  private timesheetService = inject(TimesheetService);

  selectedClient = '';
  selectedProject = '';
  selectedJob = '';
  selectedWorkItem = '';

  clients: string[] = ['Client A', 'Client B', 'Client C'];
  projects: string[] = ['SWON123', 'Project Y', 'Project Z'];
  jobs: string[] = ['DEVELOPMENT', 'SUPPORT', 'TESTING'];
  workItems: string[] = ['WorkItem 1', 'WorkItem 2', 'WorkItem 3'];

  view: 'weekly' | 'monthly' = 'weekly';
  weekOffset = 0;
  monthOffset = 0;

  weekDays: DayEntry[] = [];
  monthDays: DayEntry[] = [];

  lockedDates: string[] = [];
  allEntries: Record<string, number> = {};

  isManager = false;
  isAdmin = false;

  ngOnInit(): void {
    const token = this.authService.getAccessToken();
    if (token) {
      try {
        const decoded: any = (jwtDecode as any)(token);
        const roles = decoded?.roles || [decoded?.role];
        this.isManager = roles.includes('ROLE_MGR');
        this.isAdmin = roles.includes('ROLE_ADMIN');
      } catch {}
    }

    this.generateWeek();
    this.loadExistingData();
  }

  private isFuture(d: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const input = new Date(d);
    input.setHours(0, 0, 0, 0);
    return input.getTime() > today.getTime();
  }

  setView(view: 'weekly' | 'monthly'): void {
    this.view = view;
    this.weekOffset = 0;
    this.monthOffset = 0;

    view === 'weekly' ? this.generateWeek() : this.generateMonth();
    this.syncEntriesBetweenViews();
    this.loadExistingData();
  }

  changeOffset(delta: number): void {
    if (this.view === 'weekly') {
      this.weekOffset += delta;
      this.generateWeek();
    } else {
      this.monthOffset += delta;
      this.generateMonth();
    }

    this.syncEntriesBetweenViews();
    this.loadExistingData();
  }

  generateWeek(): void {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + diffToMonday + this.weekOffset * 7);

    const dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    this.weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const normalized = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const iso = normalized.toISOString().split('T')[0];
      return {
        name: dayNames[i],
        date: normalized,
        hours: this.allEntries[iso] ?? '',
        editable: !this.lockedDates.includes(iso) && !this.isFuture(normalized)
      };
    });
  }

  generateMonth(): void {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth() + this.monthOffset, 1);
    const year = firstDay.getFullYear();
    const month = firstDay.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();

    this.monthDays = Array.from({ length: totalDays }, (_, i) => {
      const d = new Date(Date.UTC(year, month, i + 1));
      const iso = d.toISOString().split('T')[0];
      return {
        date: d,
        hours: this.allEntries[iso] ?? '',
        name: d.toLocaleDateString(undefined, { weekday: 'long' }),
        editable: !this.lockedDates.includes(iso) && !this.isFuture(d)
      };
    });
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
    const entries  = this.view === 'weekly' ? this.weekDays : this.monthDays;
    return entries .reduce((sum, d) => sum + (Number(d.hours) || 0), 0);
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

    const rows = this.view === 'weekly' ? this.weekDays : this.monthDays;

    // Basic checks
    for (const d of rows) {
      if (Number(d.hours) > 24) {
        alert(`Cannot enter more than 24 hours on ${d.date.toDateString()}`);
        return;
      }
      if (Number(d.hours) < 0) {
        alert(`Hours cannot be negative on ${d.date.toDateString()}`);
        return;
      }
    }

    const entries = rows
      .filter(d => Number(d.hours) > 0).map(d => ({workDate: d.date.toISOString().split('T')[0],hoursWorked: Number(d.hours)}));

    if (entries.length === 0) {
      alert('Please enter hours before submitting.');
      return;
    }

    const payload = {
      startDate: rows[0].date.toISOString().split('T')[0],
      endDate: rows[rows.length - 1].date.toISOString().split('T')[0],
      timesheetType: this.view === 'weekly' ? 'WEEKLY' : 'MONTHLY',
      job: this.selectedJob.toUpperCase(),
      projectId: this.selectedProject,
      workItem: this.selectedWorkItem,
      entries
    };

    const token = this.authService.getAccessToken();
    this.timesheetService.submitTimesheet(payload as any, token).subscribe({
      next: () => {
        alert('Timesheet submitted successfully!');

        entries.forEach(e => {
          this.allEntries[e.workDate] = Number(e.hoursWorked);
          this.lockedDates.push(e.workDate);
        });

        this.lockedDates = [...new Set(this.lockedDates)];
        this.syncEntriesBetweenViews();
        this.loadExistingData();
      },
      error: (err) => {
        alert(err?.error?.message || 'Submission failed!');
      }
    });
  }

  private syncEntriesBetweenViews(): void {
    const applySync = (days: DayEntry[]) => {
      days.forEach(day => {
        const iso = day.date.toISOString().split('T')[0];
        if (this.allEntries[iso] !== undefined) {
          day.hours = this.allEntries[iso];
        }
        day.editable = !this.lockedDates.includes(iso) && !this.isFuture(day.date);
      });
    };
    applySync(this.weekDays);
    applySync(this.monthDays);
  }

  loadExistingData(): void {
    const daysArray = this.view === 'weekly' ? this.weekDays : this.monthDays;
    if (!daysArray .length) return;

    const start = daysArray[0].date.toISOString().split('T')[0];
    const end = daysArray[daysArray.length - 1].date.toISOString().split('T')[0];

    const token = this.authService.getAccessToken();

    this.timesheetService.getTimesheetEntries(start, end, token).subscribe({
      next: res => {
        const entries = res?.data?.entries || [];
        const locked = res?.data?.lockedDays || [];
        const editable = res?.data?.editable ?? true;

        // Insert DB entries
        entries.forEach((e: any) => {
          const iso = e.workDate;
          const hrs = Number(e.hoursWorked ?? 0);
          this.allEntries[iso] = hrs;
        });

        // Locked days from backend
        locked.forEach((iso: string) => {
          if (!this.lockedDates.includes(iso)) this.lockedDates.push(iso);
        });

        // IF backend says editable=false → lock all
        if (!editable) {
          daysArray .forEach(r => {
            const iso = r.date.toISOString().split('T')[0];
            if (!this.lockedDates.includes(iso)) this.lockedDates.push(iso);
          });
        }

        this.lockedDates = [...new Set(this.lockedDates)];
        this.syncEntriesBetweenViews();
      },
      error: (err) => console.error('❌ Load failed', err),
    });
  }
}
