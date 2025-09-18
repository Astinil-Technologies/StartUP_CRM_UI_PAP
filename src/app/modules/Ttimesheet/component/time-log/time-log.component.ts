import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-time-log',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './time-log.component.html',
  styleUrls: ['./time-log.component.scss'],
})
export class TimeLogComponent implements OnInit {
  selectedClient = '';
  selectedProject = '';
  selectedJob = '';
  selectedWorkItem = '';

  clients = ['Client A', 'Client B', 'Client C'];
  projects = ['Project X', 'Project Y', 'Project Z'];
  jobs = ['DEVELOPMENT', 'DESIGN', 'TESTING']; // match backend enum Job.java
  workItems = ['Task 1', 'Task 2', 'Task 3'];

  view: 'weekly' | 'monthly' = 'weekly';

  weekOffset = 0;    // for weekly navigation
  monthOffset = 0;   // for monthly navigation

  weekDays: { name: string; date: Date; hours: number }[] = [];
  monthDays: { date: Date; hours: number }[] = [];

  ngOnInit(): void {
    this.generateWeek();
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
    const day = startOfWeek.getDay(); // 0 = Sunday
    const diff = day === 0 ? -6 : 1 - day; // adjust to Monday start

    startOfWeek.setDate(today.getDate() + diff + this.weekOffset * 7);

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    this.weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return {
        name: dayNames[i],
        date: date,
        hours: 0,
      };
    });
  }

  generateMonth(): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + this.monthOffset;
    const firstDayOfMonth = new Date(year, month, 1);

    const totalDays = new Date(year, month + 1, 0).getDate();

    this.monthDays = Array.from({ length: totalDays }, (_, i) => {
      return {
        date: new Date(year, month, i + 1),
        hours: 0,
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
      if (this.monthDays.length === 0) return '';
      const firstDay = this.monthDays[0].date;
      const options = { month: 'long', year: 'numeric' } as const;
      return firstDay.toLocaleDateString(undefined, options);
    }
  }

  getTotalHours(): number {
    if (this.view === 'weekly') {
      return this.weekDays.reduce((sum, day) => sum + (day.hours || 0), 0);
    } else {
      return this.monthDays.reduce((sum, day) => sum + (day.hours || 0), 0);
    }
  }

  saveDraft(): void {
    const data = this.view === 'weekly' ? this.weekDays : this.monthDays;
    console.log('📝 Draft saved', data);
    alert('Draft saved locally! (not sent to backend)');
  }

  submit(): void {
    const isWeekly = this.view === 'weekly';

    const payload = {
      startDate: isWeekly
        ? this.weekDays[0].date.toISOString().split('T')[0]
        : this.monthDays[0].date.toISOString().split('T')[0],

      endDate: isWeekly
        ? this.weekDays[this.weekDays.length - 1].date.toISOString().split('T')[0]
        : this.monthDays[this.monthDays.length - 1].date.toISOString().split('T')[0],

      timesheetType: isWeekly ? 'WEEKLY' : 'MONTHLY',
      job: this.selectedJob.toUpperCase(),
      projectId: this.selectedProject,

      entries: (isWeekly ? this.weekDays : this.monthDays)
        .filter(day => day.hours > 0)
        .map(day => ({
          workDate: day.date.toISOString().split('T')[0],
          hoursWorked: day.hours
        }))
    };

    console.log("📤 Submitting payload:", payload);

    fetch("http://localhost:8888/timesheet/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token") // if using JWT
      },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        console.log("✅ Response:", data);
        alert("Timesheet submitted successfully!");
      })
      .catch(err => {
        console.error("❌ Error submitting timesheet:", err);
        alert("Submission failed. Check console.");
      });
  }
}
