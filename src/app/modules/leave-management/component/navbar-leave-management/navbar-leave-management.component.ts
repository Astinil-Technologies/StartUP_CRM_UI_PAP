import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from 'src/app/core/services/authservice/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './navbar-leave-management.component.html',
  styleUrls: ['./navbar-leave-management.component.scss']
})
export class NavbarComponentLeaveManagement implements OnInit {

  isAdmin = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.setRole();
  }

  private setRole(): void {
    this.isAdmin = this.authService.isAdmin();
  }

  onSignOut(): void {
    this.authService.logout();
  }
}
