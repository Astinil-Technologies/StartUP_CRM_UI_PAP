import { Component, Output, EventEmitter, OnInit} from '@angular/core';
import { AuthService } from 'src/app/core/services/authservice/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule,Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { SourceTextModule } from 'vm';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';



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
export class NavbarComponent implements OnInit{

   private baseUrl = environment.baseUrl;

  firstNameInitial: string | null = null;
  lastNameInitial: string | null = null;
  userId: string | null = null;
  status: string = 'ONLINE';// rakesh
  private statusSubscription!: Subscription;//rakesh

  @Output() profileClicked = new EventEmitter<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.userId = this.authService.getId();
    if (this.userId) {
      this.getUserDetails(this.userId);
    }

    this.statusSubscription = this.authService.userStatus$.subscribe(
      status => {
        this.status = status.toUpperCase();
      }
    );
  }



  isProfileBoxVisible: boolean = false;

  onCartIconClick(): void {
    this.isProfileBoxVisible = !this.isProfileBoxVisible; // Toggle profile box visibility
    this.profileClicked.emit(); // Emit event to load profile data
  }

  
  ngOnDestroy() { //Rakesh
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
  }
  


  getUserDetails(userId: string): void {
    const url = `${this.baseUrl}/api/v1/users/profile`;

    // ✅ Get token from AuthService
    const token = this.authService.getAccessToken();
    console.log(token);

    if (!token) {
      console.error('Token not available. User not authenticated.');
      return;
    }

    // ✅ Set Authorization Header with Bearer Token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http.get<any>(url, { headers }).subscribe(
      (response) => {
        const userData = response;
        this.firstNameInitial = userData.firstName
          ? userData.firstName.charAt(0).toUpperCase()
          : 'N';
        this.lastNameInitial = userData.lastName
          ? userData.lastName.charAt(0).toUpperCase()
          : 'N';
          this.status = userData.status ? userData.status.toUpperCase() : 'N';//rakesh

      
      },
      
      (error) => {
        console.error('Error fetching user details:', error);
      }
    );
  }

 
}