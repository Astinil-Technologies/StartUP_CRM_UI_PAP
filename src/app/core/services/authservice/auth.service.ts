import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User } from 'src/app/models/user.model';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { TokenService } from '../tokenservice/token.service';
import { jwtDecode } from 'jwt-decode';

import { BehaviorSubject } from 'rxjs';// Rakesh


@Injectable({
  providedIn: 'root',
})
export class AuthService { 
  private apiUrl = environment.apiUrl;
  private courseUrl= environment.courseUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
    private tokenService: TokenService
  ) {}



  postData(data: { name: string; description: string; }): Observable<any>{
    const token = this.tokenService.getAccessToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(this.courseUrl, data, { headers });
  }
  /**
   * Retrieves the user ID from the access token.
   * @returns The user ID or null if token is invalid or not found.
   */
  getId(): string | null{
    const token = this.tokenService.getAccessToken();
    if(token){
      try{
        const decodedToken : any = jwtDecode(token);
        return decodedToken.id || null;
      } catch (error){
        console.error('Error decoding token:', error);
        return null;
      }
    }
    console.warn('No token found in cookies');
    return null;
  }
  /**
   * Registers a new user and stores the tokens.
   * @param user - User object containing username, email, password, etc.
   * @returns Observable of response with tokens (access token and refresh token).
   */
  register(user: User): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/register`, user, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      })
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Logs in the user, stores the tokens, and returns the server response.
   * @param user - User credentials (email and password).
   * @returns Observable of response with tokens.
   */ 
  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  /**
   * Refreshes the access token using the stored refresh token.
   * @returns Observable of new access token response.
   */
  refreshAccessToken(): Observable<any> {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('Refresh token is missing.'));
    }

    return this.http
      .post<any>(`${this.apiUrl}/refresh-token`, { refreshToken }, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      })
      .pipe(
        map((response) => {
          this.tokenService.storeTokens(response.accessToken, response.refreshToken);
          return response;
        }),
        catchError((error) => {
          this.logout();
          return throwError(() => new Error('Session expired. Please log in again.'));
        })
      );
  }

  /**
   * Retrieves the access token from TokenService.
   * @returns The access token string or null if not found.
   */
  getAccessToken(): string | null {
    const token = this.tokenService.getAccessToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000); 
        if (decodedToken.exp < currentTime) {
          console.error('Access token has expired');
          this.tokenService.clearTokens();
          return null; 
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
    return token;
  }
  /**
   * Refreshes the access token using the refresh token.
   * @returns Observable with the new tokens.
   */
  refreshToken(): Observable<any> {
    const refreshToken = this.tokenService.getRefreshToken();
    return this.http.post(`${this.apiUrl}/refresh-token`, { refreshToken });
  }
  /**
   * Checks if a refresh token exists in cookies.
   * @returns True if refresh token exists, otherwise false.
   */
  hasRefreshToken(): boolean {
    return !!this.tokenService.getRefreshToken();
  }
    /**
   * Checks if the user is authenticated based on the presence of a valid access token.
   * @returns True if the user is authenticated, otherwise false.
   */

  isAuthenticated(): boolean {
    return !!this.tokenService.getAccessToken(); 
  }
  

  /**
   * Logs out the user by clearing tokens and redirecting to the login page.
   */
  logout(): void {
    this.tokenService.clearTokens();
    this.router.navigate(['/login']); 
  }

  /**
   * Handles HTTP errors gracefully and provides user-friendly messages.
   * @param error - The error from the HTTP request.
   * @returns Observable that throws an error with a user-friendly message.
   */
  public handleError(error: HttpErrorResponse): Observable<never> {
    console.error('HTTP Error:', error);
    let errorMessage = 'An unknown error occurred';
     if (error.error instanceof ErrorEvent){
      errorMessage = `Client-side Error: ${error.error.message}` ;
    } else {
      errorMessage = `Server-side Error: ${error.status} - ${error.message}`;
      if (error.status === 401 && error.error?.message) {
       errorMessage = `${error.error.message}`;
      } else if (error.status === 500) {
        errorMessage = 'Server error occurred. Please try again later.';
   
      }
    }
    return throwError(() => new Error(errorMessage));
  }
  /**
   * Handles Google login, stores the tokens, and returns the server response.
   * @param googleToken - The Google ID token.
   * @returns Observable of response with tokens.
   */
  googleLogin(googleToken: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/google`, { googleToken }, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    }).pipe(
      map((response) => {
        this.tokenService.storeTokens(response.data.accessToken, response.data.refreshToken);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  // Add this to handle status updates
private userStatusSubject = new BehaviorSubject<string>('ONLINE');
userStatus$ = this.userStatusSubject.asObservable();

setUserStatus(status: string): void {
  this.userStatusSubject.next(status);
}

}