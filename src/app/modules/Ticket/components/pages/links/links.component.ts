import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-links',
  standalone:true,
   imports: [CommonModule],
  templateUrl: './links.component.html',
  styleUrls: ['./links.component.scss']
})

export class LinksComponent {

@Output() close = new EventEmitter<void>();

}
