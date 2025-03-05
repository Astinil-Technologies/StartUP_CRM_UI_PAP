import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from 'src/app/models/user.model';
import { AuthService } from '../authservice/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService { 
  private apiUrl = 'http://localhost:8080/api/v1/users'; 

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Method to fetch all users
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      catchError(this.authService.handleError)
    );
  }

  // Method to fetch a user by ID
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      catchError(this.authService.handleError)
    );
  }

  // Method to update user information
  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${user.id}`, user, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      catchError(this.authService.handleError)
    );
  }

  // Method to delete a user
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      catchError(this.authService.handleError)
    );
  }

  requestPasswordReset(email: string): Observable<Response> {
    return this.http.post<Response>(`${this.apiUrl}/request-password-reset`, { email }, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      catchError(this.authService.handleError)
    );
  }
  
  resetPassword(token: string, newPassword: string): Observable<Response> {
    return this.http.post<Response>(`${this.apiUrl}/reset-password`, { token, newPassword }, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      catchError(this.authService.handleError)
    );
  }  
}