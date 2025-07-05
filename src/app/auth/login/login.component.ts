import { Component, Input, Output, EventEmitter } from '@angular/core';
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
    private navigationService: NavigationService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
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
