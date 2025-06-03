import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/authservice/auth.service';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar-component',
  standalone: true,
  imports: [MatIconModule, CommonModule, RouterModule, FormsModule],
  templateUrl: './sidebar-component.component.html',
  styleUrl: './sidebar-component.component.scss',
})
export class SidebarComponentComponent implements OnInit {
  private baseUrl = environment.baseUrl;
  userId: string | null = null;
  firstName: string | null = null;
  lastName: string | null = null;
  @Input() isSidebarOpen = false;

  statusOptions: string[] = ['ONLINE', 'OFFLINE', 'IN_MEETING'];

  // Profile Variables
  userData: any = null;
  isProfileBoxVisible: boolean = false;
  isLoading: boolean = true;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.userId = this.authService.getId();

    if (this.userId) {
      this.getUserDetails(this.userId);
    }

    this.loadUserProfile();
  }

  // logout() {
  //   this.authService.logout();
  // }

  getUserDetails(userId: string): void {
    const url = `${this.baseUrl}/api/v1/users/${userId}`;
    this.http.get<any>(url).subscribe(
      (response) => {
        const userData = response.data;
        this.firstName = userData.firstName;
        this.lastName = userData.lastName;
      },
      (error) => {
        console.error('Error fetching user details:', error);
      }
    );
  }

  loadUserProfile() {
    const url = `${this.baseUrl}/api/v1/users/profile`;
    const token = this.authService.getAccessToken();
    console.log(token);

    if (!token) {
      console.error('Token not available. User not authenticated.');
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer${token}`,
    });

    this.http.get<any>(url, { headers }).subscribe(
      (response) => {
        console.log(response);

        this.userData = {
          ...response,
          status: response.status || 'Online',
        };

        this.userData = response;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading profile data', error);
        this.isLoading = false;
      }
    );
  }

  onStatusChange() {
    console.log('User changed status to:', this.userData.status);
    this.authService.setUserStatus(this.userData.status);

    const url = `${this.baseUrl}/api/v1/users/status`;
    const token = this.authService.getAccessToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    const body = { status: this.userData.status };

    this.http.put(url, body, { headers }).subscribe(
      (response) => {
        console.log('Status updated successfully:', response);
      },
      (error) => {
        console.error('Error updating status:', error);
      }
    );
  }

  toggleProfileBox() {
    this.isProfileBoxVisible = !this.isProfileBoxVisible;
  }

  logout(): void {
    const token = this.authService.getAccessToken();

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      const logoutRequest = { token };
      this.http
        .post(`${this.baseUrl}/auth/logout`, logoutRequest, {
          responseType: 'text',
        })
        .subscribe({
          next: () => this.handleLogoutSuccess(),
          error: (err) => {
            console.error('Logout failed:', err);
            this.handleLogoutSuccess();
          },
        });
    } else {
      this.handleLogoutSuccess();
    }
  }

  handleLogoutSuccess(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');

    this.snackBar.open('Logout successful', 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: ['success-snackbar'],
    });

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1000);
  }
}
