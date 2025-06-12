import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/core/services/authservice/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { UserDataService } from 'src/app/core/services/user-data.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatIconModule, RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {

  private baseUrl = environment.baseUrl;

  firstNameInitial: string | null = null;
  lastNameInitial: string | null = null;
  userId: string | null = null;
  status: string = 'ONLINE';

  private userDataSubscription!: Subscription;
  private statusSubscription!: Subscription;

  @Output() profileClicked = new EventEmitter<void>();
  isProfileBoxVisible: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private userDataService: UserDataService
  ) {}

  ngOnInit() {
    this.userId = this.authService.getId();
    if (this.userId) {
      this.getUserDetails(this.userId);
    }

    // ⬇️ Listen to live status changes
    this.statusSubscription = this.authService.userStatus$.subscribe(
      (status: string) => {
        this.status = status.toUpperCase();
      }
    );

    // ⬇️ Listen to user profile updates
    this.userDataSubscription = this.userDataService.userData$.subscribe((userData) => {
      if (userData) {
        this.setInitials(userData.firstName, userData.lastName);
        this.status = userData.status ? userData.status.toUpperCase() : 'N';
      }
    });
  }

  ngOnDestroy() {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
    if (this.userDataSubscription) {
      this.userDataSubscription.unsubscribe();
    }
  }

  onCartIconClick(): void {
    this.isProfileBoxVisible = !this.isProfileBoxVisible;
    this.profileClicked.emit();
  }

  getUserDetails(userId: string): void {
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
        this.setInitials(response.firstName, response.lastName);
        this.status = response.status ? response.status.toUpperCase() : 'N';

        // 🔁 Save to shared service
        this.userDataService.setUserData(response);
      },
      (error) => {
        console.error('Error fetching user details:', error);
      }
    );
  }

  private setInitials(firstName: string, lastName: string): void {
    this.firstNameInitial = firstName ? firstName.charAt(0).toUpperCase() : 'N';
    this.lastNameInitial = lastName ? lastName.charAt(0).toUpperCase() : 'N';
  }
}
