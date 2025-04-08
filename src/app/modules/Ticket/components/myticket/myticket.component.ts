
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, throwError } from 'rxjs';
import { AuthService } from 'src/app/core/services/authservice/auth.service';


interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdTimestamp: any;
  assignedUserId: string;
}

@Component({
  selector: 'app-myticket',
  standalone: true,
  imports: [CommonModule ,  FormsModule],
  templateUrl: './myticket.component.html',
  styleUrls: ['./myticket.component.scss']
})
export class MyticketComponent implements OnInit {

  tickets: Ticket[] = [];
  apiUrl = 'http://localhost:8080/tickets/getAllTickets'; // Backend API URL

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    const userId = this.authService.getId();
    if (userId) {
      this.fetchTickets(Number(userId));
    } else {
      console.warn('No user ID found. User may not be authenticated.');
    }
  }

  fetchTickets(userId: number, query?: string) {
    const token = this.authService.getAccessToken();
    if (!token) {
      console.error('❌ Token not available. User not authenticated.');
      return;
    }

    // Set request headers with Authorization token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    // Prepare request params
    let params: any = { userId };
    if (query) params.query = query;

    this.http.get<Ticket[]>(this.apiUrl, { params, headers })
      .pipe(catchError(this.handleError))
      .subscribe({
        next: (data) => {
          this.tickets = data;
          console.log('✅ Fetched Tickets:', data);
        },
        error: (error) => console.error('❌ Error fetching tickets:', error)
      });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('❌ API Error:', error);
    return throwError(() => new Error('Failed to fetch tickets. Please try again later.'));
  }

  updateTicket(ticket: Ticket) {
    // You can navigate to an update page or open a modal with ticket details
    console.log('✏️ Update ticket clicked:', ticket);
    // Example: this.router.navigate(['/update-ticket', ticket.id]);
  }
  
  deleteTicket(ticketId: number) {
    const confirmed = confirm('Are you sure you want to delete this ticket?');
    if (!confirmed) return;
  
    const token = this.authService.getAccessToken();
    if (!token) {
      console.error('❌ Token not available. User not authenticated.');
      return;
    }
  
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  
    const deleteUrl = `http://localhost:8080/tickets/${ticketId}`;
  
    this.http.delete(deleteUrl, { headers })
      .pipe(catchError(this.handleError))
      .subscribe({
        next: () => {
          console.log('🗑️ Ticket deleted successfully');
          this.tickets = this.tickets.filter(ticket => ticket.id !== ticketId);
        },
        error: (err) => console.error('❌ Error deleting ticket:', err)
      });
  }


}
