import { Component } from '@angular/core';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.scss']
})
export class EmployeeDashboardComponent {
  totalRequests = 3;
  pendingRequests = 1;
  approvedRequests = 1;
  rejectedRequests = 1;
  totalDaysTaken = 5;
}
