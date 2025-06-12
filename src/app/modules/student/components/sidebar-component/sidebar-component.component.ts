import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/authservice/auth.service';
import { FormsModule } from '@angular/forms';
import { RegisterComponent } from 'src/app/auth/register/register.component';
import { LoginComponent } from 'src/app/auth/login/login.component';
import { LoginMainComponent } from 'src/app/auth/login-main/login-main.component';
import { UserDataService } from 'src/app/core/services/user-data.service';

@Component({
  selector: 'app-sidebar-component',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    RouterModule,
    RegisterComponent,
    LoginComponent,
    LoginMainComponent,
    FormsModule
  ],
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

  userData: any = null;
  isProfileBoxVisible: boolean = false;
  isLoading: boolean = true;

  showAddAccountBox = false;
  showSwitchAccountBox = false;

  selectedProfileImage: File | null = null;
  previewUrl: string | null = null;
  isEditingProfileImage = false;
  showSaveButton = false;

  switchEmail: string = '';
  switchPassword: string = '';

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private userDataService: UserDataService
  ) {}

  ngOnInit() {
    this.userId = this.authService.getId();
    if (this.userId) {
      this.getUserDetails(this.userId);
    }
    this.loadUserProfile();
  }

  logout() {
    this.authService.logout();
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login-main']);
  }

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

    if (!token) {
      console.error('Token not available. User not authenticated.');
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http.get<any>(url, { headers }).subscribe(
      (response) => {
        this.userData = {
          ...response,
          status: response.status || 'Online'
        };

        if (this.userData.profileImageUrl) {
          this.previewUrl = `${this.baseUrl}/${this.userData.profileImageUrl}`;
          this.isEditingProfileImage = false;
        } else {
          this.previewUrl = null;
          this.isEditingProfileImage = true;
        }

        this.isLoading = false;
        this.userDataService.setUserData(this.userData);
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error loading profile data', error);
        this.isLoading = false;
      }
    );
  }

  onStatusChange() {
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

  openAddAccount() {
    this.showAddAccountBox = true;
    this.showSwitchAccountBox = false;
  }

  openSwitchAccount() {
    this.showSwitchAccountBox = true;
    this.showAddAccountBox = false;
  }

  closePopup() {
    this.showAddAccountBox = false;
    this.showSwitchAccountBox = false;
    this.userId = this.authService.getId();
    if (this.userId) {
      this.getUserDetails(this.userId);
      this.loadUserProfile();
    }
    this.cdr.detectChanges();
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  enableImageEdit() {
    this.isEditingProfileImage = true;
  }

  onProfileImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Please upload a JPG, JPEG, PNG, or WEBP image.');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert('Image is too large. Maximum size allowed is 2MB.');
        return;
      }

      this.selectedProfileImage = file;
      this.showSaveButton = true;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadProfileImage(): void {
    if (!this.selectedProfileImage || !this.userId) return;

    const formData = new FormData();
    formData.append('image', this.selectedProfileImage);

    const url = `${this.baseUrl}/api/v1/users/${this.userId}/upload-profile-image`;
    const token = this.authService.getAccessToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.post(url, formData, { headers }).subscribe(
      (response) => {
        console.log('Profile image uploaded successfully', response);
        this.isEditingProfileImage = false;
        this.showSaveButton = false;
        this.loadUserProfile();
      },
      (error) => {
        console.error('Error uploading profile image:', error);
      }
    );
  }

  switchAccount(): void {
    const url = `${this.baseUrl}/auth/switch-account`;

    const body = {
      email: this.switchEmail,
      password: this.switchPassword
    };

    this.http.post<any>(url, body).subscribe(
      (response) => {
        if (response.data?.token) {
          this.authService.setToken(response.data.token);
          this.authService.setRefreshToken(response.data.refreshToken);

          this.closePopup();
        } else {
          alert('Unexpected response format.');
        }
      },
      (error) => {
        alert(error?.error?.message || 'User not found or invalid credentials.');
      }
    );
  }
}
