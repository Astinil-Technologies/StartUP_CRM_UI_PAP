import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveService } from 'src/app/core/services/leave/leave.service';
import { LeaveBalanceService } from 'src/app/core/services/leave/leave-balance.service';
import { HolidayService } from 'src/app/core/services/leave/holiday.service';
import { AuthService } from 'src/app/core/services/authservice/auth.service';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule],
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
  totalDaysTaken: number = 0;

  teamPendingCount: number = 0;
  holidays: any[] = [];

  showModal: boolean = false;
  modalTitle: string = '';
  modalData: any[] = [];
  paginatedData: any[] = [];
  loading: boolean = false;

  page: number = 1;
  pageSize: number = 5;
  startIndex: number = 0;
  endIndex: number = 5;

pendingApprovals: any[] = [];
recentActivity: string[] = [];


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
    this.buildRecentActivity();
  }

  loadLeaveCountsFromMyLeaves() {
    this.leaveService.getMyLeaves().subscribe({
      next: (res: any[]) => {
        this.totalLeaves = res.length;
        this.pendingLeaves = res.filter(x => x.status === 'PENDING').length;
        this.approvedLeaves = res.filter(x => x.status === 'APPROVED').length;
        this.rejectedLeaves = res.filter(x => x.status === 'REJECTED').length;
      },
      error: () => console.error('Error loading leave counts')
    });
  }

  loadUpcomingLeaves() {
    this.leaveService.getMyLeaves().subscribe({
      next: (res: any[]) => {
        const today = new Date();
        this.upcomingLeaves = res.filter(l =>
          new Date(l.start_date) > today && l.status === 'APPROVED'
        );
        this.upcomingCount = this.upcomingLeaves.length;
      },
      error: () => console.error('Error loading upcoming leaves')
    });
  }

  loadRecentLeaves() {
    this.leaveService.getMyLeaves().subscribe({
      next: (res: any[]) => {
        this.recentLeaves = [...res]
          .sort((a, b) =>
            new Date(b.start_date).getTime() -
            new Date(a.start_date).getTime()
          )
          .slice(0, 5);
      },
      error: () => console.error('Error loading recent leaves')
    });
  }

  loadTotalDaysTaken() {
    this.leaveService.getMyLeaves().subscribe({
      next: (res: any[]) => {
        const today = new Date();
        const approvedPastLeaves = res.filter(l =>
          l.status === 'APPROVED' &&
          new Date(l.end_date) <= today
        );

        this.totalDaysTaken = approvedPastLeaves.reduce((sum, l) => {
          const start = new Date(l.start_date);
          const end = new Date(l.end_date);
          const diff =
            Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          return sum + diff;
        }, 0);
      },
      error: () => console.error('Error loading total days taken')
    });
  }

loadTeamPendingApprovals() {
  this.leaveService.getMyLeaves().subscribe({
    next: (res: any[]) => {
      this.pendingApprovals = res
        .filter(l => l.status === 'PENDING')
        .slice(0, 5)
        .map(l => ({
          leaveType: l.leave_type || l.leaveType,
          start: l.start_date || l.startDate,
          end: l.end_date || l.endDate
        }));

      this.teamPendingCount = this.pendingApprovals.length;
    },
    error: () => console.error('Error loading pending approvals')
  });
}

loadHolidays() {
  this.holidayService.getAllHolidays().subscribe({
    next: (res: any[]) => {
      this.holidays = res;
    },
    error: () => console.error('Error loading holidays')
  });
}

buildRecentActivity() {
  this.leaveService.getMyLeaves().subscribe((res: any[]) => {
    this.recentActivity = res
  .sort((a: any, b: any) =>
    new Date(b.start_date || b.startDate).getTime() -
    new Date(a.start_date || a.startDate).getTime()
  )
  .slice(0, 5)
  .map((l: any) => {
    const start = l.start_date || l.startDate;
    const end = l.end_date || l.endDate;

    if (l.status === 'APPROVED') {
      return `Leave approved (${start} → ${end})`;
    }
    if (l.status === 'PENDING') {
      return `Leave request submitted (${start})`;
    }
    return `Leave rejected (${start})`;
  });
  });
}
  openCard(type: string) {
    this.showModal = true;
    this.loading = true;
    this.page = 1;

    if (type === 'TEAM_PENDING') {
      this.modalTitle = 'Team Pending Approvals';
      this.leaveService.getTeamLeaves('PENDING').subscribe({
        next: (res: any[]) => {
          this.modalData = res;
          this.updatePagination();
          this.loading = false;
        },
        error: () => (this.loading = false)
      });
      return;
    }

    this.leaveService.getMyLeaves().subscribe({
      next: (res: any[]) => {
        let data = [...res];
        const today = new Date();

        switch (type) {
          case 'TOTAL':
            this.modalTitle = 'All Leave Requests';
            break;

          case 'PENDING':
            this.modalTitle = 'Pending Leaves';
            data = data.filter(l => l.status === 'PENDING');
            break;

          case 'APPROVED':
            this.modalTitle = 'Approved Leaves';
            data = data.filter(l => l.status === 'APPROVED');
            break;

          case 'REJECTED':
            this.modalTitle = 'Rejected Leaves';
            data = data.filter(l => l.status === 'REJECTED');
            break;

          case 'UPCOMING':
            this.modalTitle = 'Upcoming Leaves';
            data = data.filter(l =>
              new Date(l.start_date) > today && l.status === 'APPROVED'
            );
            break;

          case 'RECENT':
            this.modalTitle = 'Recent Leaves';
            data = data
              .sort((a, b) =>
                new Date(b.start_date).getTime() -
                new Date(a.start_date).getTime()
              )
              .slice(0, 10);
            break;

          case 'DAYS':
            this.modalTitle = 'Approved Past Leaves';
            data = data.filter(l =>
              l.status === 'APPROVED' &&
              new Date(l.end_date) <= today
            );
            break;
        }

        this.modalData = data;
        this.updatePagination();
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  updatePagination() {
    this.startIndex = (this.page - 1) * this.pageSize;
    this.endIndex = this.startIndex + this.pageSize;
    this.paginatedData = this.modalData.slice(this.startIndex, this.endIndex);
  }

  nextPage() {
    this.page++;
    this.updatePagination();
  }

  prevPage() {
    this.page--;
    this.updatePagination();
  }

  closeModal() {
    this.showModal = false;
  }
}
