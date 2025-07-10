import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-more',
  standalone:true,
  imports:[CommonModule],
  templateUrl: './more.component.html',
  styleUrls: ['./more.component.scss']
})
export class MoreComponent {
  @Output() close = new EventEmitter<void>();
}
