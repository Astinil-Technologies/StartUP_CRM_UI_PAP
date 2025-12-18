import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ApplyLeaveComponent } from './apply-leave.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule,ApplyLeaveComponent],
  exports: [ApplyLeaveComponent]
})
export class ApplyLeaveModule {}
