import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home-section',
  standalone: true,
  imports: [ 
    RouterModule,
    MatIconModule,
   ],
  templateUrl: './home-section.component.html',
  styleUrl: './home-section.component.scss'
})
export class HomeSectionComponent {
  images: string[] = [
    'https://t3.ftcdn.net/jpg/02/55/22/68/360_F_255226859_Rhqr5hflr2esVXHQE1sS1bWxmZxs0gWI.jpg',
    'https://images.pexels.com/photos/301920/pexels-photo-301920.jpeg?cs=srgb&dl=pexels-pixabay-301920.jpg&fm=jpg',
    'https://media.istockphoto.com/id/521611936/photo/student-studying-sleeping-on-books-tired-girl-read-book-library.jpg?s=612x612&w=0&k=20&c=_hrHE-ktKc_c3RSe1wKxVlPrdpsllJkVQ9y_kgw4WMA='
  ]; 
  currentImageIndex: number = 0;

  moveSlide(direction: number): void {
    this.currentImageIndex += direction;
    if (this.currentImageIndex < 0) {
      this.currentImageIndex = this.images.length - 1;
    } else if (this.currentImageIndex >= this.images.length) {
      this.currentImageIndex = 0;
    }
  }
}
