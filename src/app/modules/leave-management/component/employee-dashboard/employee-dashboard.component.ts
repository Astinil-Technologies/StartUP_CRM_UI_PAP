import { Component, OnInit } from '@angular/core';
import { LeaveService } from 'src/app/core/services/leave/leave.service';
import { LeaveBalanceService } from 'src/app/core/services/leave/leave-balance.service';
import { HolidayService } from 'src/app/core/services/leave/holiday.service';
import { AuthService } from 'src/app/core/services/authservice/auth.service';

@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.scss']
})
export class EmployeeDashboardComponent implements OnInit {

  employeeId: number = 0;
  userId: number = 0;
  isManager: boolean = false;

  totalLeaves: number = 0;
  pendingLeaves: number = 0;
  approvedLeaves: number = 0;
  rejectedLeaves: number = 0;

  upcomingLeaves: any[] = [];
  upcomingCount: number = 0;

  recentLeaves: any[] = [];
  leaveBalance: any[] = [];
  totalDaysTaken: number = 0;

  teamPendingCount: number = 0;
  holidays: any[] = [];
totalRequests: any;

  constructor(
    private leaveService: LeaveService,
    private leaveBalanceService: LeaveBalanceService,
    private holidayService: HolidayService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUserDetails();
    this.employeeId = user?.employeeId;
    this.userId = user?.id;
    this.isManager = user?.role === 'ROLE_MGR' || user?.role === 'ROLE_ADMIN';

    this.loadLeaveCountsFromMyLeaves();
    this.loadUpcomingLeaves();
    this.loadRecentLeaves();
    this.loadTotalDaysTaken();
    this.loadTeamPendingApprovals();
    this.loadHolidays();
  }

  // --------------------------------------------------------------------
  // ✅ 1) Load counts (total/pending/approved/rejected) from /my-leaves
  // --------------------------------------------------------------------
  loadLeaveCountsFromMyLeaves() {
    this.leaveService.getMyLeaves().subscribe({
      next: (res: any[]) => {
        // IMPORTANT: MAP snake_case → camelCase
        const leaves = res.map(l => ({
          ...l,
          status: l.status,
          startDate: l.start_date,
          endDate: l.end_date,
          leaveType: l.leave_type
        }));

        // Counts
        this.totalLeaves = leaves.length;
        this.pendingLeaves = leaves.filter(x => x.status === 'PENDING').length;
        this.approvedLeaves = leaves.filter(x => x.status === 'APPROVED').length;
        this.rejectedLeaves = leaves.filter(x => x.status === 'REJECTED').length;
      },
      error: () => console.error("Failed loading my leaves")
    });
  }

  // --------------------------------------------------------------------
  // 2) Upcoming leaves
  // --------------------------------------------------------------------
  loadUpcomingLeaves() {
  this.leaveService.getMyLeaves().subscribe({
    next: (res: any[]) => {

      const today = new Date();

      const leaves = res.map(l => {
        const start = new Date(l.start_date || l.startDate);
        const end = new Date(l.end_date || l.endDate);

        return {
          ...l,
          startDate: isNaN(start.getTime()) ? null : start,
          endDate: isNaN(end.getTime()) ? null : end,
          status: l.status
        };
      });

      // filter only those leaves which have a valid date
      this.upcomingLeaves = leaves.filter(l =>
        l.startDate &&
        l.startDate > today &&
        (l.status === 'APPROVED')
      );

      this.upcomingCount = this.upcomingLeaves.length;
    },
    error: () => console.error("Error loading upcoming leaves")
  });
}

  // --------------------------------------------------------------------
  // 3) Recent leaves (last 5)
  // --------------------------------------------------------------------
  loadRecentLeaves() {
    this.leaveService.getMyLeaves().subscribe({
      next: (res: any[]) => {
        const leaves = res.map(l => ({
          ...l,
          startDate: l.start_date,
          endDate: l.end_date
        }));

        this.recentLeaves = [...leaves]
          .sort((a, b) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
          .slice(0, 5);
      },
      error: () => console.error("Failed loading recent leaves")
    });   
  }

  // --------------------------------------------------------------------
  // 4) Leave balance (used/available)
  // --------------------------------------------------------------------
 loadTotalDaysTaken() {
  this.leaveService.getMyLeaves().subscribe({
    next: (res: any[]) => {

      const today = new Date();

      const leaves = res.map(l => {
        const sd = new Date(l.start_date || l.startDate);
        const ed = new Date(l.end_date || l.endDate);

        return {
          ...l,
          startDate: isNaN(sd.getTime()) ? null : sd,
          endDate: isNaN(ed.getTime()) ? null : ed,
          status: l.status
        };
      });

      // ✅ Count only APPROVED leaves that are already completed
      const pastApproved = leaves.filter(l =>
        l.status === "APPROVED" &&
        l.startDate !== null &&
        l.endDate !== null &&
        l.endDate <= today        // ← IMPORTANT: do not count future leaves
      );

      this.totalDaysTaken = pastApproved.reduce((sum, l) => {
        const diffDays =
          Math.floor((l.endDate.getTime() - l.startDate.getTime()) /
          (1000 * 60 * 60 * 24)) + 1;

        return sum + diffDays;
      }, 0);
    },
    error: () => console.error("Error loading total days taken")
  });
}

  // --------------------------------------------------------------------
  // 5) Team pending approvals (only for manager)
  // --------------------------------------------------------------------
  loadTeamPendingApprovals() {
    if (!this.isManager) return;

    this.leaveService.getTeamLeaves('PENDING').subscribe({
      next: (res: any[]) => {
        this.teamPendingCount = res.length;
      },
      error: () => console.error("Error loading team pending")
    });
  }

  // --------------------------------------------------------------------
  // 6) Holidays
  // --------------------------------------------------------------------
  loadHolidays() {
    this.holidayService.getAllHolidays().subscribe({
      next: (res: any[]) => (this.holidays = res),
      error: () => console.error("Error loading holidays")
    });
  }
}
