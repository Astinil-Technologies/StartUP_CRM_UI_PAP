import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface LeaveRequest {
  requestId: string;
  type: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: 'Pending' | 'Approved' | 'Rejected';
}

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-requests.component.html',
  styleUrls: ['./my-requests.component.scss']
})
export class MyRequestsComponent {
  searchText: string = '';
  selectedStatus: string = '';
  selectedType: string = '';

  leaveTypes: string[] = ['Sick Leave', 'Vacation', 'Casual Leave'];

  leaveRequests: LeaveRequest[] = [
    { requestId: 'LR001', type: 'Sick Leave', startDate: '2024-01-15', endDate: '2024-01-16', totalDays: 2, status: 'Pending' },
    { requestId: 'LR002', type: 'Vacation', startDate: '2024-01-20', endDate: '2024-01-25', totalDays: 5, status: 'Approved' },
    { requestId: 'LR003', type: 'Casual Leave', startDate: '2024-01-10', endDate: '2024-01-10', totalDays: 1, status: 'Rejected' }
  ];

  filteredLeaves(): LeaveRequest[] {
    return this.leaveRequests.filter(leave => {
      const matchesSearch =
        !this.searchText ||
        leave.requestId.toLowerCase().includes(this.searchText.toLowerCase()) ||
        leave.type.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesStatus = !this.selectedStatus || leave.status === this.selectedStatus;
      const matchesType = !this.selectedType || leave.type === this.selectedType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }

  getStatusClass(status: string): string {
    return status;
  }
}
