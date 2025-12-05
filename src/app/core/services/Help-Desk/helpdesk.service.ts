import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Ticket } from 'src/app/models/ticket.model';
import { TokenService } from 'src/app/core/services/tokenservice/token.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private baseUrl = `${environment.baseUrl}/api/tickets`;

  // Helper method to get Authorization headers
  private getAuthHeaders(): HttpHeaders {
    const token = this.tokenService.getAccessToken();
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

 //  Create Ticket with JSON
  createTicket(ticket: any): Observable<any> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Username': localStorage.getItem('username') || 'guest',
    'Authorization': `Bearer ${this.tokenService.getAccessToken()}`
  });

  return this.http.post(`${this.baseUrl}`, JSON.stringify(ticket), { headers });
}

  // Get All Tickets
  getAllTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.baseUrl, { headers: this.getAuthHeaders() });
  }

  // Get Username
  getUsername(): Observable<string> {
    return this.http.get(`${this.baseUrl}/username`, { headers: this.getAuthHeaders(), responseType: 'text' });
  }

  // Update Ticket
  updateTicket(ticket: Ticket): Observable<any> {
    return this.http.put(`${this.baseUrl}/${ticket.ticketId}`, ticket, { headers: this.getAuthHeaders() });
  }

  // Delete Ticket
  deleteTicket(ticketId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${ticketId}/delete`, {}, { headers: this.getAuthHeaders(), responseType: 'text' });
  }
}
