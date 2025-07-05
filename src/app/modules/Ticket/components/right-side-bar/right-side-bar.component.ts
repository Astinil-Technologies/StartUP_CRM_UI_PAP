import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
  selector: 'app-right-side-bar',
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
  templateUrl: './right-side-bar.component.html',
  styleUrls: ['./right-side-bar.component.scss']
})
export class RightSideBarComponent {
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
  showActivityPanel: boolean = false;

  toggleActivityPanel(): void {
    this.showActivityPanel = !this.showActivityPanel;
  }

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

  formatTime(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  trackByIndex(index: number): number {
    return index;
  }
}
