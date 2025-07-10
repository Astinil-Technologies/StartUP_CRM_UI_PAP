import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LinksComponent } from '../pages/links/links.component';
import { MoreComponent } from '../pages/more/more.component';

@Component({
  selector: 'app-sideNavbar',
  standalone: true,
  imports: [CommonModule, RouterModule, LinksComponent,MoreComponent],
  templateUrl: './sideNavbar.component.html',
  styleUrl: './sideNavbar.component.scss',
})
export class SideNavbarComponent {
  showLinksTextPanel = false;
  showLinksPanel = false;

  toggleLinksTextPanel() {
    this.showLinksTextPanel = !this.showLinksTextPanel;
  }

  toggleLinksPanel() {
    this.showLinksPanel = !this.showLinksPanel;
  }
}
