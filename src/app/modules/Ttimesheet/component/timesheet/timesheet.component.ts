import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-timesheet',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './timesheet.component.html',
  styleUrls: ['./timesheet.component.scss']
})
export class TimesheetComponent implements OnInit {
  private http = inject(HttpClient);

  timesheets: any[] = [];

  ngOnInit() {
    this.loadTimesheets();
  }

  loadTimesheets() {
    this.http.get<any>('http://localhost:8888/timesheet/history')
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.timesheets = res.data;
          }
        },
        error: (err) => {
          console.error('Error fetching timesheets:', err);
        }
      });
  }
}
