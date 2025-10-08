import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TokenService } from 'src/app/core/services/tokenservice/token.service';
import * as jwtDecode from 'jwt-decode';
import { Role } from 'src/app/role/role.enum'; // adjust path

@Component({
  selector: 'app-timesheet-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './timesheet-navbar.component.html',
  styleUrls: ['./timesheet-navbar.component.scss']
})
export class TimesheetNavbarComponent implements OnInit {
  topNavbarVisible: boolean = true;
  currentUserRoles: string[] = [];

  constructor(private tokenService: TokenService) {}

  ngOnInit(): void {
    const token = this.tokenService.getAccessToken();

    if (token) {
      try {
        const decoded: any = (jwtDecode as any).default(token);
        console.log('Decoded JWT:', decoded);

        this.currentUserRoles = this.extractRoles(decoded);
        console.log('Current User Roles:', this.currentUserRoles);

      } catch (error) {
        console.error('Error decoding token:', error);
        this.currentUserRoles = [];
      }
    } else {
      console.warn('No access token found');
    }
  }

  /**
   * Universal method to extract roles from JWT payload
   */
  private extractRoles(decodedToken: any): string[] {
    if (!decodedToken) return [];

    // Backend may send roles in different properties
    const possibleProps = ['roles', 'authorities', 'authority', 'scope', 'permissions'];

    for (const prop of possibleProps) {
      const roles = decodedToken[prop];
      if (roles) {
        if (Array.isArray(roles)) return roles;
        if (typeof roles === 'string') return [roles];
      }
    }

    return [];
  }

  /**
   * Check if current user has ROLE_USER
   */
  isUser(): boolean {
    return this.currentUserRoles.includes(Role.User);
  }
}
