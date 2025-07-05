import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleMeetingDialogComponent } from './schedule-meeting-dialog.component';

describe('ScheduleMeetingDialogComponent', () => {
  let component: ScheduleMeetingDialogComponent;
  let fixture: ComponentFixture<ScheduleMeetingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleMeetingDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleMeetingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
