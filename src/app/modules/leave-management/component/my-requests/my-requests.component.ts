import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LeaveService } from 'src/app/core/services/leave/leave.service';
import { LeaveBalanceService } from 'src/app/core/services/leave/leave-balance.service';

interface LeaveRequest {
  id: number;
  userId: number;
  reason: string;
  leaveType: string;
  status: string;
  startDate: string;
  endDate: string;
  attachmentUrl: string | null;
  isHalfDay: boolean;
  managerComment: string | null;
  approvedBy: number | null;
}

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-requests.component.html',
  styleUrls: ['./my-requests.component.scss'],
})
export class MyRequestsComponent implements OnInit {

  /* -------------------- SEARCH / FILTER -------------------- */
  searchText = '';
  selectedStatus = '';
  selectedType = '';
  leaveRequests: LeaveRequest[] = [];

  /* -------------------- CIRCLE PROGRESS SETTINGS -------------------- */
  radius = 30;
  circumference = 2 * Math.PI * this.radius;
  maxLeaves = 12; // full circle when 12 remain

  getOffset(remaining: number) {
    const percent = remaining / this.maxLeaves;
    return this.circumference * (1 - percent);
  }

  /* -------------------- LEAVE BALANCE VALUES -------------------- */
  remainingSick = 0;
  remainingCasual = 0;
  remainingEarned = 0;
  remainingCompOff = 0;
  remainingAnnual = 0;

  constructor(
    private leaveService: LeaveService,
    private leaveBalanceService: LeaveBalanceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMyLeaves();
    this.loadLeaveBalance();
  }

  /* -------------------- EDIT -------------------- */
  onEdit(leave: LeaveRequest) {
    this.router.navigate(
      ['/layout/leave-management/apply-leave'],
      { queryParams: { id: leave.id } }
    );
  }

  /* -------------------- CANCEL -------------------- */
  onCancel(id: number) {
    const token = localStorage.getItem('token');

    if (!confirm("Are you sure you want to cancel this leave request?")) return;

    this.leaveService.deleteLeave(id, token).subscribe({
      next: () => {
        alert("Leave request cancelled successfully!");
        this.leaveRequests = this.leaveRequests.filter(l => l.id !== id);
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || "Failed to cancel leave");
      }
    });
  }

  /* -------------------- LOAD LEAVE REQUESTS -------------------- */
  loadMyLeaves() {
    const token = localStorage.getItem('token');

    this.leaveService.getMyLeaves(token).subscribe({
      next: (res) => {
        this.leaveRequests = Array.isArray(res) ? res : [];
      },
      error: (err) => console.error(err)
    });
  }

  /* -------------------- CALCULATE TOTAL DAYS -------------------- */
  getTotalDays(start: string, end: string): number {
    const s = new Date(start);
    const e = new Date(end);
    return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  /* -------------------- FILTER TABLE -------------------- */
  filteredLeaves(): LeaveRequest[] {
    return this.leaveRequests.filter(leave => {

      const searchText = this.searchText.toLowerCase();

      const matchesSearch =
        !this.searchText ||
        leave.id.toString().includes(searchText) ||
        (leave.leaveType || '').toLowerCase().includes(searchText);

      const matchesStatus =
        !this.selectedStatus || leave.status === this.selectedStatus;

      const matchesType =
        !this.selectedType || leave.leaveType === this.selectedType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }

  getStatusClass(status: string) {
    return status;
  }

  /* -------------------- LOAD LEAVE BALANCE -------------------- */
  loadLeaveBalance() {
    const token = localStorage.getItem('token');
    const userId = Number(localStorage.getItem('userId'));

    this.leaveBalanceService.getBalance(userId, token).subscribe({
      next: (res: any) => {
        console.log("Backend response:", res);

        const rows = res.balances;

        // Reset
        this.remainingSick = 0;
        this.remainingCasual = 0;
        this.remainingEarned = 0;
        this.remainingCompOff = 0;
        this.remainingAnnual = 0;

        rows.forEach((row: any) => {
          switch (row.leaveType) {
            case 'SICK':
              this.remainingSick = row.remaining;
              break;

            case 'CASUAL':
              this.remainingCasual = row.remaining;
              break;

            case 'EARNED':
              this.remainingEarned = row.remaining;
              break;

            case 'COMP_OFF':
              this.remainingCompOff = row.remaining;
              break;

            case 'ANNUAL':
              this.remainingAnnual = row.remaining;
              break;
          }
        });
      },
      error: (err) => console.error("Balance Load Error:", err)
    });
  }
}
