import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,

  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})

export class ProfileComponent {
  user = {
    firstName: '',
    lastName: '',
    headline: '',
    language: 'English (US)'
  };

  constructor(private router: Router) {}
  onSave() {
    console.log('Profile saved', this.user);
  }
}
