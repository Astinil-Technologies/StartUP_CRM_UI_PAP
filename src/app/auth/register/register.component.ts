import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { environment } from 'src/environments/environment';
import { CommonModule, Location } from '@angular/common';
import { passwordMatchValidator } from './password-match.validator';
import { TokenService } from 'src/app/core/services/tokenservice/token.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private location: Location,
    private tokenService: TokenService
  ) {
    this.registerForm = this.fb.group(
      {
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        username: ['', [Validators.required, Validators.minLength(3)]], 
        email: ['', [Validators.required, Validators.email]],
        mobile_no: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,}$'),
          ],
        ],
        confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
      },
      { validators: passwordMatchValidator } 
    );
  }

  /**
   * On form submission, registers the user and stores the JWT token.
   */
  onRegister() {
    if (this.registerForm.valid && !this.registerForm.hasError('passwordMismatch')) {
      const userData = this.registerForm.value;
      const rememberMe = this.registerForm.get('rememberMe')?.value ?? false;
 
      this.http.post(`${environment.apiUrl}/register`, userData).subscribe(
        (response: any) => {
          alert('User registered successfully');
          console.log('User registered successfully', response);


          this.tokenService.storeTokens(response.accessToken, response.refreshToken);

      
          this.router.navigate(['/dashboard']);
        },
        (error) => {
          alert('Registration failed. Please try again.');
          console.error('Error registering user', error);
        }
      );
    } else {
      this.registerForm.markAllAsTouched(); 
    }
  }

 
  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

 
  passwordLengthError() {
    return (
      this.registerForm.get('password')?.hasError('minlength') &&
      this.registerForm.get('password')?.touched
    );
  }

  passwordAlphanumericError() {
    return (
      this.registerForm.get('password')?.hasError('pattern') &&
      this.registerForm.get('password')?.touched
    );
  }


  mismatchError() {
    return (
      this.registerForm.get('confirmPassword')?.touched &&
      this.registerForm.hasError('passwordMismatch')
    );
  }


  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  
  navigateBack() {
    this.location.back();
  }
}