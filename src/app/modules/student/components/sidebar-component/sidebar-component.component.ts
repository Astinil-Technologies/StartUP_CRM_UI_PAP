import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {  RouterModule } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/authservice/auth.service';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-sidebar-component',
  standalone: true,
  imports: [MatIconModule, 
    CommonModule,
    RouterModule,
  FormsModule],
  templateUrl: './sidebar-component.component.html',
  styleUrl: './sidebar-component.component.scss',
})
export class SidebarComponentComponent implements OnInit{

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

  constructor(private authService: AuthService, private http: HttpClient) {}

  ngOnInit() {
    this.userId = this.authService.getId();

    if (this.userId) {
      this.getUserDetails(this.userId);
    }

    // Load Profile Data
    this.loadUserProfile();
  }

  logout() {
    this.authService.logout();
  }

  // Fetch User Details
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

  // Load Profile Data


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
          status: response.status || 'Online'
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
  this.authService.setUserStatus(this.userData.status); // Optional local storage use

  const url = `${this.baseUrl}/api/v1/users/status`;
  const token = this.authService.getAccessToken();

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`, // Notice the space after Bearer
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

  // Toggle Profile Box Visibility
  toggleProfileBox() {
    this.isProfileBoxVisible = !this.isProfileBoxVisible;
  }
  
}
