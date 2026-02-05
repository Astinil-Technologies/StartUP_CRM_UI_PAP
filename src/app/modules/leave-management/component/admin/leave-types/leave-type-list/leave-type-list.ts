import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LeaveBalanceService } from 'src/app/core/services/leave/leave-balance.service';
import { LeaveTypeService } from 'src/app/core/services/leave/leave-type.service';
import { LeaveTypeResponse } from 'src/app/models/leave-type.model';

@Component({
  selector: 'app-leave-type-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave-type-list.html',
  styleUrls: ['./leave-type-list.scss']
})
export class LeaveTypeListComponent implements OnInit {

  leaveTypes: LeaveTypeResponse[] = [];
  loading = false;
  errorMessage = '';
  searchText = '';

  constructor(
    private leaveTypeService: LeaveTypeService,
    private leaveBalanceService: LeaveBalanceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchLeaveTypes();
  }

  fetchLeaveTypes(): void {
    this.loading = true;
    this.leaveTypeService.getAll().subscribe({
      next: (data) => {
        this.leaveTypes = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load leave types';
        this.loading = false;
      }
    });
  }

  onAddLeaveType(): void {
    this.router.navigate(['/layout/leave-management/leave-types/create']);
  }

  onEditLeaveType(lt: LeaveTypeResponse): void {
    this.router.navigate([
      '/layout/leave-management/leave-types/edit',
      lt.id
    ]);
  }

  onDeleteLeaveType(id: number): void {
    if (!confirm('Delete this leave type?')) return;

    this.leaveTypeService.delete(id).subscribe(() => {
      this.leaveTypes = this.leaveTypes.filter(t => t.id !== id);
    });
  }

  get sortedLeaveTypes(): LeaveTypeResponse[] {
    return this.leaveTypes.filter(lt =>
      lt.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  onGenerateLeaveBalance(): void {
  const token = localStorage.getItem('token');

  if (!confirm('This will generate leave balance for all employees. Continue?')) {
    return;
  }
  this.leaveBalanceService.generateYearly(token).subscribe({
    next: (res) => {
      alert(res || 'Leave balance generated successfully');
    },
    error: (err) => {
      console.error('Backend error:', err);

      const msg =
        err?.error ||
        err?.error?.message ||
        'No employees found to generate leave balance';

      alert(msg);
    }
  });
}
}
