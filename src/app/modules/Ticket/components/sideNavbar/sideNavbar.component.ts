import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivityComponent } from '../activity/activity.component';

@Component({
  selector: 'app-sideNavbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ActivityComponent],
  templateUrl: './sideNavbar.component.html',
  styleUrl: './sideNavbar.component.scss'
})
export class SideNavbarComponent {
  showActivityPanel: boolean = false;

  toggleActivity(event: Event): void {
    event.preventDefault();
    this.showActivityPanel = !this.showActivityPanel; // ✅ Toggle logic
  }

  closeActivity() {
    this.showActivityPanel = false;
  }
}
