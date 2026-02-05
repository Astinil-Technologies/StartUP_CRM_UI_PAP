import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveTypeForm } from './leave-type-form';

describe('LeaveTypeForm', () => {
  let component: LeaveTypeForm;
  let fixture: ComponentFixture<LeaveTypeForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveTypeForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveTypeForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
