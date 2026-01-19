import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LeaveTypeService } from '../leave-type.service';
import { LeaveTypeResponse } from 'src/app/models/leave-type.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-leave-type-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave-type-list.component.html',
  styleUrls: ['./leave-type-list.component.scss']
})
export class LeaveTypeListComponent implements OnInit {

  leaveTypes: LeaveTypeResponse[] = [];
  loading = false;
  errorMessage = '';

  // 🔍 Search
  searchText = '';

  // 🔃 Sorting
  sortField: 'name' | 'yearlyQuota' | 'active' = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private leaveTypeService: LeaveTypeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchLeaveTypes();
  }

  fetchLeaveTypes(): void {
    this.loading = true;
    this.errorMessage = '';

    this.leaveTypeService.getAll().subscribe({
      next: (data: LeaveTypeResponse[]) => {
        this.leaveTypes = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load leave types';
      }
    });
  }

  onAddLeaveType(): void {
  this.router.navigate(['/layout/leave-management/admin/leave-types/create']);
}

 onEditLeaveType(id: number): void {
  this.router.navigate(['/layout/leave-management/admin/leave-types/edit', id]);
}


  // ❌ SIMPLE DELETE (NO MODAL – STEP 9)
  onDeleteLeaveType(id: number): void {
    const confirmed = confirm(
      'Are you sure you want to delete this leave type?'
    );

    if (!confirmed) return;

    this.leaveTypeService.delete(id).subscribe({
      next: () => {
        this.leaveTypes = this.leaveTypes.filter(t => t.id !== id);
        alert('Leave type deleted successfully');
      },
      error: (err) => {
        alert(err?.error?.message || 'Failed to delete leave type');
      }
    });
  }

  onSearchChange(): void {}

  sortBy(field: 'name' | 'yearlyQuota' | 'active'): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }

  // 🔽 FILTER + SORT (FINAL DATA)
  get sortedLeaveTypes(): LeaveTypeResponse[] {
    const filtered = this.leaveTypes.filter(lt =>
      lt.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
      (lt.description || '').toLowerCase().includes(this.searchText.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      let aVal: any = a[this.sortField];
      let bVal: any = b[this.sortField];

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }
}
