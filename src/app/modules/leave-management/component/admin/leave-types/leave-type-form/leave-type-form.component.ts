import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LeaveTypeService } from '../leave-type.service';
import { LeaveTypeEnum,LeaveTypeRequest,LeaveTypeResponse } from 'src/app/models/leave-type.model';

@Component({
  selector: 'app-leave-type-form',
  standalone: true,                 // ✅ REQUIRED
  imports: [
    CommonModule,
    ReactiveFormsModule              // ✅ FIX (THIS WAS MISSING)
  ],
  templateUrl: './leave-type-form.component.html',
  styleUrls: ['./leave-type-form.component.scss']
})
export class LeaveTypeFormComponent implements OnInit {

  leaveTypeForm!: FormGroup;
  isEditMode = false;
  leaveTypeId!: number;

  leaveTypeOptions = Object.values(LeaveTypeEnum);

  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private leaveTypeService: LeaveTypeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.leaveTypeId = +idParam;
      this.loadLeaveTypeForEdit();
      this.leaveTypeForm.get('name')?.disable();
    }
  }

  initForm(): void {
    this.leaveTypeForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      yearlyQuota: [0, [Validators.required, Validators.min(0)]],
      carryForward: [false, Validators.required],
      maxPerMonth: [0, Validators.min(0)]
    });
  }

  loadLeaveTypeForEdit(): void {
    this.loading = true;

    this.leaveTypeService.getAll().subscribe({
      next: (list: LeaveTypeResponse[]) => {
        const leaveType = list.find(l => l.id === this.leaveTypeId);

        if (!leaveType) {
          alert('Leave type not found');
          this.router.navigate(['/leave-management/admin/leave-types']);
          return;
        }

        this.leaveTypeForm.patchValue(leaveType);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load leave type';
      }
    });
  }

 onSubmit(): void {
  if (this.leaveTypeForm.invalid) {
    this.leaveTypeForm.markAllAsTouched();
    return;
  }

  const payload = this.leaveTypeForm.getRawValue();
  this.loading = true;

  if (this.isEditMode) {
    this.leaveTypeService.update(this.leaveTypeId, payload).subscribe({
      next: () => {
        this.loading = false;
        alert('Leave type updated successfully');
        this.router.navigate(['/leave-management/admin/leave-types']);
      },
      error: (err) => {
  this.loading = false;

  const message =
    err?.error?.message ||
    err?.error ||
    'Failed to create leave type';

  alert(message);
}

    });
  } else {
    this.leaveTypeService.create(payload).subscribe({
      next: () => {
        this.loading = false;
        alert('Leave type created successfully');
        this.router.navigate(['/leave-management/admin/leave-types']);
      },
      error: () => {
        this.loading = false; // ✅ IMPORTANT
        alert('Leave type already exists');
      }
    });
  }
}

filterExistingLeaveTypes(): void {
  this.leaveTypeService.getAll().subscribe({
    next: (existing) => {
      const usedTypes = existing.map(t => t.name);
      this.leaveTypeOptions = this.leaveTypeOptions.filter(
        type => !usedTypes.includes(type)
      );
    }
  });
}
onCancel(): void {
    this.router.navigate(['/leave-management/admin/leave-types']);
  }
}
