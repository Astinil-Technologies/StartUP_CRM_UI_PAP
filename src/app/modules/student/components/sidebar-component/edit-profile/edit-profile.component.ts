import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { EditProfileService } from 'src/app/core/services/editProfileService/edit-profile-service';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [BrowserModule, ReactiveFormsModule],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss'
})
export class EditProfileComponent implements OnInit {

  successMessage: string = '';
  errorMessage: string = '';
  showSuccessToast: boolean = false;
  showErrorToast: boolean = false;
  profileForm!: FormGroup;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(private editProfileService: EditProfileService) { }

  ngOnInit() {
    this.profileForm = new FormGroup({
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      username: new FormControl(''),
      profileImage: new FormControl(''),
      email: new FormControl(''),
      mobileNo: new FormControl(''),
      bio: new FormControl(''),
      location: new FormControl(''),
      createdAt: new FormControl(''),
    });

    // fetching image form the db, 
    this.editProfileService.getUserProfile().subscribe((data: any) => {
      this.previewUrl = data.profileImage?.startsWith('data:image') ? data.profileImage : 'data:image/png;base64,' + data.profileImage;

      this.profileForm.patchValue({
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        email: data.email,
        mobileNo: data.mobileNo,
        bio: data.bio,
        location: data.location,
        profileImage: data.profileImage,
        createdAt: data.createdAt
      });
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
        this.profileForm.patchValue({ profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.profileForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      this.showErrorToast = true;
      this.autoHideToast('error');
      return;
    }

    const user = this.profileForm.value;

    this.editProfileService.updateUserProfile(user).subscribe({
      next: (response) => {
        this.successMessage = 'Profile updated successfully!';
        this.showSuccessToast = true;
        this.autoHideToast('success');
      },
      error: (error) => {
        this.errorMessage = 'Failed to update profile. Please try again.';
        this.showErrorToast = true;
        this.autoHideToast('error');
      }
    });
  }

  autoHideToast(type: 'success' | 'error') {
    setTimeout(() => {
      if (type === 'success') {
        this.showSuccessToast = false;
        this.successMessage = '';
      } else {
        this.showErrorToast = false;
        this.errorMessage = '';
      }
    }, 3000); // hides after 3 seconds
  }

}
