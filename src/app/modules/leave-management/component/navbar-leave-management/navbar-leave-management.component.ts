import { Component ,OnInit} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TokenService } from 'src/app/core/services/tokenservice/token.service';
import { jwtDecode } from 'jwt-decode';
import { Role } from 'src/app/role/role.enum';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './navbar-leave-management.component.html',
  styleUrls: ['./navbar-leave-management.component.scss']
})
export class NavbarComponentLeaveManagement implements OnInit {

  topNavbarVisible: boolean = true;
  currentUserRoles: string[] = [];

  constructor(private tokenService: TokenService) {}

  ngOnInit(): void {
    const token = this.tokenService.getAccessToken();

    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        console.log('Decoded JWT (Leave):', decoded);

        this.currentUserRoles = this.extractRoles(decoded);
        console.log('User Roles (Leave):', this.currentUserRoles);

      } catch (error) {
        console.error('JWT decode error:', error);
        this.currentUserRoles = [];
      }
    } else {
      console.warn('No access token found');
    }
  }

 private extractRoles(decodedToken: any): string[] {
  if (!decodedToken) return [];

  const possibleProps = ['roles', 'authorities', 'authority', 'scope', 'permissions'];

  for (const prop of possibleProps) {
    const roles = decodedToken[prop];

    if (roles) {
      if (Array.isArray(roles) && typeof roles[0] === 'string') {
        return roles.map(r => r.toUpperCase());
      }

      if (Array.isArray(roles) && typeof roles[0] === 'object') {
        return roles
          .map((r: any) => r.authority || r.role || r.name)
          .filter(Boolean)
          .map((r: string) => r.toUpperCase());
      }

      if (typeof roles === 'string') {
        return [roles.toUpperCase()];
      }
    }
  }
  return [];
}

  isAdmin(): boolean {
    return this.currentUserRoles.includes(Role.Admin);
  }
}