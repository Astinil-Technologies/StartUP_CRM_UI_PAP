import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { inject } from '@angular/core';
import { AuthService } from '../services/authservice/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);

  // BehaviorSubject for managing token refresh states
  const refreshTokenSubject = new BehaviorSubject<string | null>(null);
  let isRefreshing = false;

  // Get the access token from the AuthService
  const accessToken = authService.getAccessToken();

  // Attach the Authorization header with the access token if it exists
  if (accessToken) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && authService.hasRefreshToken()) {
        if (!isRefreshing) {
          // Start the token refresh process
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authService.refreshAccessToken().pipe(
            switchMap((response: any) => {
              isRefreshing = false;
              const newToken = response?.accessToken;
              if (newToken) {
                localStorage.setItem('accessToken', newToken);
              refreshTokenSubject.next(newToken);

              // Retry the failed request with the new token
              const clonedRequest = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`,
                },
              });
              return next(clonedRequest);
            } else {
              authService.logout();
              return throwError(() => new Error('Session expired. Please log in again.'));
            }
            }),
            catchError((refreshError) => {
              isRefreshing = false;
              console.error('Access token refresh failed:', refreshError);
              authService.logout();
              return throwError(() => new Error('Session expired. Please log in again.'));
            })
          );
        } else {
          // Queue subsequent requests until the token is refreshed
          return refreshTokenSubject.pipe(
            filter((token) => token != null), // Only continue when we have a token
            take(1), // Take only the first value emitted
            switchMap((token) => {
              const clonedRequest = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${token}`,
                },
              });
              return next(clonedRequest);
            })
          );
        }
      } else {
        // For all other errors, propagate the error
        return throwError(() => error);
      }
    })
  );
}; 