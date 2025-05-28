
import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { TokenService } from 'src/app/core/services/tokenservice/token.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent {
  name: string = '';
  type: string = '';
  size: number = 0;
  receiverUsername: string = '';
  selectedFile: File | null = null;

  private baseUrl = environment.baseUrl;
  private uploadUrl = `${this.baseUrl}/api/files/upload-by-username`;

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  triggerFileInput(): void {
    const input = document.getElementById('fileInput') as HTMLInputElement;
    if (input) input.click();
  }

  onFileChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target?.files && target.files.length > 0) {
      this.selectedFile = target.files[0];
      this.name = this.selectedFile.name;
      this.type = this.selectedFile.type;
      this.size = Math.round(this.selectedFile.size / 1024);
    }
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      alert('Please select a file.');
      return;
    }

    const token = this.tokenService.getAccessToken();
    if (!token) {
      alert('You are not authenticated.');
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('name', this.name);
    formData.append('type', this.type);
    formData.append('size', this.size.toString());
    formData.append('receiverUsername', this.receiverUsername);

    this.http.post(this.uploadUrl, formData, { headers, responseType: 'text' }).subscribe({
      next: (res) => {
        console.log('Response:', res);
        alert('File uploaded successfully');
      },
      error: (error) => {
        console.error('Upload failed:', error);
        alert('Upload failed. Check backend logs.');
      }
    });
  }
}
