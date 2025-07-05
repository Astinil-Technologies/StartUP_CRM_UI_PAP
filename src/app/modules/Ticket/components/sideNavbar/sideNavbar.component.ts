import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sideNavbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sideNavbar.component.html',
  styleUrl: './sideNavbar.component.scss'
})
export class SideNavbarComponent {
showActivityPanel: boolean = false;

  toggleActivityPanel() {
    this.showActivityPanel = !this.showActivityPanel;
  }
}
