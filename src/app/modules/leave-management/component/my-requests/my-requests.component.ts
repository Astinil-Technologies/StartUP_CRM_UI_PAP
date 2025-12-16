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

<<<<<<< Updated upstream
  leaveRequests: LeaveRequest[] = [
    { requestId: 'LR001', type: 'Sick Leave', startDate: '2024-01-15', endDate: '2024-01-16', totalDays: 2, status: 'Pending' },
    { requestId: 'LR002', type: 'Vacation', startDate: '2024-01-20', endDate: '2024-01-25', totalDays: 5, status: 'Approved' },
    { requestId: 'LR003', type: 'Casual Leave', startDate: '2024-01-10', endDate: '2024-01-10', totalDays: 1, status: 'Rejected' }
  ];

=======
  /* -------------------- CIRCLE PROGRESS SETTINGS -------------------- */
  radius = 30;
  circumference = 2 * Math.PI * this.radius;
 // maxLeaves = 12; // full circle when 12 remain

getOffset(remaining: number, total: number) {
  if (!total) return this.circumference;
  const percent = remaining / total;
  return this.circumference * (1 - percent);
}

  /* -------------------- LEAVE BALANCE VALUES -------------------- */
  remainingSick = 0;
  remainingCasual = 0;
  remainingEarned = 0;
  remainingCompOff = 0;
  remainingLop = 0;

  totalSick = 0;
totalCasual = 0;
totalEarned = 0;
totalCompOff = 0;
totalLop = 0;


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
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======

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
        this.remainingLop = 0;

        rows.forEach((row: any) => {
  switch (row.leaveType) {
    case 'SICK':
      this.remainingSick = row.remaining;
      this.totalSick = row.total;
      break;

    case 'CASUAL':
      this.remainingCasual = row.remaining;
      this.totalCasual = row.total;
      break;

    case 'EARNED':
      this.remainingEarned = row.remaining;
      this.totalEarned = row.total;
      break;

    case 'COMP_OFF':
      this.remainingCompOff = row.remaining;
      this.totalCompOff = row.total;
      break;

    case 'LOP':
      this.remainingLop = row.remaining;
      this.totalLop = row.total;
      break;
  }
});

      },
      error: (err) => console.error("Balance Load Error:", err)
    });
  }
>>>>>>> Stashed changes
}
