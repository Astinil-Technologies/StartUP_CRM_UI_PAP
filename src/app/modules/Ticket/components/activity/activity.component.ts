import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

interface Activity {
  message: string;
  createdBy: string;
  createdAt: string; // ISO string
}

@Component({
  selector: 'activity',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule
  ],
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent {
  @Input() showActivityPanel: boolean = false;
  @Output() close = new EventEmitter<void>();

  activities: Activity[] = [
    {
      message: 'Ticket created',
      createdBy: 'System',
      createdAt: new Date().toISOString()
    },
    {
      message: 'Initial user comment',
      createdBy: 'Alice',
      createdAt: new Date().toISOString()
    }
  ];

  newComment: string = '';

  sendComment(): void {
    const trimmed = this.newComment.trim();
    if (trimmed) {
      this.activities.push({
        message: trimmed,
        createdBy: 'You',
        createdAt: new Date().toISOString()
      });
      this.newComment = '';
    }
  }
}
