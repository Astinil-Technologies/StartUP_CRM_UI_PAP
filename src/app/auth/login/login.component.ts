import {
  Component, Input, Output, EventEmitter, OnInit,
  NgZone, AfterViewInit
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/core/services/authservice/auth.service';
import { TokenService } from 'src/app/core/services/tokenservice/token.service';
import { ForgotPasswordPopupComponent } from '../forgot-password-popup/forgot-password-popup.component';
import { Location } from '@angular/common';
import { NavigationService } from 'src/app/core/services/navigationservice/navigation.service';
import { jwtDecode } from 'jwt-decode';

// Add Google type declaration to avoid TS error
declare global {
  interface Window {
    google: any;
  }
}


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    MatDialogModule,
  ],
})
export class LoginComponent {
  @Input() isSwitchAccountMode = false;               // ✅ Input for switch account mode
  @Output() loginSuccess = new EventEmitter<void>();  // ✅ Output event to close popup

  hidePassword: boolean = true;
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public dialog: MatDialog,
    private authService: AuthService,
    private tokenService: TokenService,
    private snackBar: MatSnackBar,
    private location: Location,
    private navigationService: NavigationService,
    private ngZone: NgZone,
    private http: HttpClient
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern('^[a-zA-Z0-9]*$'),
        ],
      ],
      rememberMe: [false],
    });
  }
  ngOnInit(): void {
    if (window.google && window.google.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: '282387866257-nkoqplsvhptndjn1e8spi3aaio7vkr3g.apps.googleusercontent.com',
        callback: this.handleCredentialResponse.bind(this),
      });
    } else {
      console.warn('Google Sign-In SDK not loaded.');
    }
  }
  ngAfterViewInit(): void {
    if (window.google && window.google.accounts?.id) {
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
        }
      );
    }
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      const email = this.loginForm.get('email')?.value ?? '';
      const password = this.loginForm.get('password')?.value ?? '';
      const rememberMe = this.loginForm.get('rememberMe')?.value ?? false;

      this.authService.login({ username: email, password }).subscribe({
        next: (response) => {
          this.tokenService.storeTokens(
            response.data.accessToken,
            response.data.refreshToken
          );

          // ✅ Emit event only in switch account mode
          if (this.isSwitchAccountMode) {
            this.loginSuccess.emit();
          }

          // ✅ Decode accessToken and store user info
          const decoded: any = jwtDecode(response.data.accessToken);
          if (decoded?.id && decoded?.sub) {
            localStorage.setItem('loggedInId', decoded.id.toString());
            localStorage.setItem('loggedInUsername', decoded.sub); // ✅ use sub for username
            console.log('✅ Stored ID and username:', decoded);
          } else {
            console.warn('⚠ Could not extract id or username from token:', decoded);
          }


          this.navigationService.navigateBasedOnRole();
        },
        error: (error: HttpErrorResponse) => this.handleLoginError(error),
      });

    } else {
      this.snackBar.open(
        'Please fill in all required fields correctly.',
        'Close',
        {
          duration: 3000,
          panelClass: ['error-snackbar'],
        }
      );
    }
  }
  handleCredentialResponse(response: any): void {
    this.sendGoogleTokenToBackend(response.credential);
  }

  sendGoogleTokenToBackend(token: string): void {
    this.authService.googleLogin(token).subscribe({
      next: (response: any) => {
        this.tokenService.storeTokens(
          response.data.accessToken,
          response.data.refreshToken
        );
        this.ngZone.run(() => {
          this.navigationService.navigateBasedOnRole();
        });
      },
      error: (error) => {
        console.error('Google Sign-In failed:', error);
        this.snackBar.open('Google login failed.', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      }
    });
  }
  private handleLoginError(error: HttpErrorResponse): void {
    console.error(error);

    if (error.status === 401) {
      this.snackBar.open('Invalid username or password.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    } else if (error.status >= 500) {
      this.snackBar.open(
        'Server error occurred. Please try again later.',
        'Close',
        {
          duration: 3000,
          panelClass: ['error-snackbar'],
        }
      );
    } else {
      this.snackBar.open(`${error.message}`, 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    }
  }

  ForgotPassword(): void {
    this.dialog.open(ForgotPasswordPopupComponent);
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  passwordLengthError(): boolean {
    const hasMinLengthError =
      this.loginForm.get('password')?.hasError('minlength') ?? false;
    const isTouched = this.loginForm.get('password')?.touched ?? false;
    return hasMinLengthError && isTouched;
  }

  passwordAlphanumericError(): boolean {
    const hasPatternError =
      this.loginForm.get('password')?.hasError('pattern') ?? false;
    const isTouched = this.loginForm.get('password')?.touched ?? false;
    return hasPatternError && isTouched;
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateBack(): void {
    this.location.back();
  }
}
