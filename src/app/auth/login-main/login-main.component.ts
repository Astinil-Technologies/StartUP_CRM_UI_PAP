import { Component, OnInit, Injector, NgZone } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LoginToDiffAccPopupComponent } from './login-to-diff-acc-popup/login-to-diff-acc-popup.component';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/services/authservice/auth.service';
import { TokenService } from 'src/app/core/services/tokenservice/token.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavigationService } from 'src/app/core/services/navigationservice/navigation.service';


@Component({
  selector: 'app-login-main',
  standalone: true,
  imports: [
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './login-main.component.html',
  styleUrl: './login-main.component.scss'
})
export class LoginMainComponent implements OnInit {
  user: any;
  loggedIn: boolean | undefined;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private http: HttpClient,
    private injector: Injector,
    private ngZone: NgZone,
    private tokenService: TokenService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private navigationService: NavigationService
  ) {}

  ngOnInit(): void {
    window.onload = () => {
      google.accounts.id.initialize({
        client_id: '282387866257-nkoqplsvhptndjn1e8spi3aaio7vkr3g.apps.googleusercontent.com',
        callback: this.handleCredentialResponse.bind(this)
      });
      google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { theme: 'outline', size: 'large' }
      );
    };
  }

  handleCredentialResponse(response: any): void {
    console.log('Encoded JWT ID token: ' + response.credential);
    this.sendGoogleTokenToBackend(response.credential);
  }

  sendGoogleTokenToBackend(token: string): void {
    this.authService.googleLogin(token).subscribe({
      next: (response: any) => {
        console.log('Login Success:', response);
        this.tokenService.storeTokens(response.data.accessToken, response.data.refreshToken);
        this.navigateToLoginAndCallOnLogin();
      },
      error: error => console.error('Login Failed:', error)
    });
  }

  LogInToDifferentAccount(): void {
    this.dialog.open(LoginToDiffAccPopupComponent);
  }

 navigateToRegister(event: Event): void {
  event.preventDefault();
  this.router.navigate(['/register']);
}


  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToLoginAndCallOnLogin(): void {
    this.ngZone.run(() => {
      this.router.navigate(['/login']).then(() => {
        this.navigationService.navigateBasedOnRole();
      });
    });
  }
}