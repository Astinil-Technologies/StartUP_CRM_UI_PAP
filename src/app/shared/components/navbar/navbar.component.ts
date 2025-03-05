import { Component, Output, EventEmitter} from '@angular/core';
import { AuthService } from 'src/app/core/services/authservice/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule,Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    MatIconModule,
    RouterModule,
    CommonModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent{
  userId: string | null = null
  firstNameInitial: string | null = null
  lastNameInitial: string | null = null
  constructor(private authService: AuthService, private router: Router,
    private http: HttpClient
  ) {}

  @Output() profileClicked = new EventEmitter<void>();

  onCartIconClick(): void {
    this.profileClicked.emit();
  }
  logout() {
    this.authService.logout();
    alert('User logged out successfully');
    this.router.navigate(['/login']);
  }

  ngOnInit() {
    this.userId = this.authService.getId();

    if (this.userId) {
      this.getUserDetails(this.userId);
    }
  }


  getUserDetails(userId: string): void {
    const url = `http://localhost:8080/api/v1/users/${userId}`;
    this.http.get<any>(url).subscribe(
      (response) => {
        const userData = response.data;
        this.firstNameInitial = userData.firstName ? userData.firstName.charAt(0).toUpperCase() : 'N';
        this.lastNameInitial = userData.lastName ? userData.lastName.charAt(0).toUpperCase() : 'N';
      },
      (error) => {
        console.error('Error fetching user details:', error);
      }
    );
  }
}