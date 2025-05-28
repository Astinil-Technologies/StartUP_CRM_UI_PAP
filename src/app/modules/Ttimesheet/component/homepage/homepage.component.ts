import { CommonModule, NgClass, NgIf } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/authservice/auth.service';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/core/services/userservice/user.service';


@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [NgIf , NgClass, CommonModule],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class HomepageComponent implements OnInit {

  private baseUrl = environment.baseUrl;

  userData: any = null;
  isLoading: boolean = true;
  userId: any;
  status: string = 'OUT';
  checkInTime: string = '00:00:00'; 
  private timerInterval: any;
  private elapsedSeconds: number = 0;
 

  constructor(private authService: AuthService, private http: HttpClient, private userService: UserService) {}

  ngOnInit() {
    this.userId = this.authService.getId();
    console.log(this.userId);

    this.loadUserProfile();

  }


  // Fetch Profile Details from API
   loadUserProfile() {
    this.userService.getUserProfile().subscribe(
      (data) => {
        if (data) {
          console.log(data);
          this.userData = data;
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading profile data', error);
        this.isLoading = false;
      }
    );
  }

  toggleStatus() {
    if (this.status === 'OUT') {
      this.status = 'IN'; // Check-in
      this.checkIn();
      this.elapsedSeconds = 0; // Reset the counter
      this.startTimer();
      
    } else {
      this.status = 'OUT'; // Check-out
      this.checkOut();
      this.stopTimer();
      
    }
  }

  startTimer() {
    this.stopTimer(); // Ensure no duplicate intervals
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds++;
      this.checkInTime = this.formatTime(this.elapsedSeconds);
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  formatTime(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  pad(num: number): string {
    return num.toString().padStart(2, '0');
  }



   // Check-in function (backend integration)
   checkIn() {
    const url = `${this.baseUrl}/api/checkout/checkin`;
    const token = this.authService.getAccessToken();

    if (!token) {
      console.error('Token not available. User not authenticated.');
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http.post(url, {}, { headers }).subscribe(
      (response) => {
        console.log('Checked in successfully');
       // this.loadStatus();  // Update status after check-in
      },
      (error) => {
        console.error('Error checking in', error);
      }
    );
  }

  // Check-out function (backend integration)
  checkOut() {
    const url = `${this.baseUrl}/api/checkout`;
    const token = this.authService.getAccessToken();

    if (!token) {
      console.error('Token not available. User not authenticated.');
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http.post(url, {}, { headers }).subscribe(
      (response) => {
        console.log('Checked out successfully');
      },
      (error) => {
        console.error('Error checking out', error);
      }
    );
  }

  // Load current check-in status from backend (GET Status)
  loadStatus() {
    const url = `${this.baseUrl}/api/checkout/status`;
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
        console.log(response);
        this.status = response.status;  // Set status based on the backend response
      },
      (error) => {
        console.error('Error loading status', error);
      }
    );
  }

}
