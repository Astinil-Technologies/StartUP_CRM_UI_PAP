import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Define an interface for chat messages
interface ChatMessage {
  sender: string;
  message: string;
}

@Component({
  standalone: true,
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class ChatComponent {
  @Input() meetingId!: string;

  chatMessages: ChatMessage[] = []; // 👈 Use an array of objects
  message: string = '';

  sendMessage() {
    if (this.message.trim()) {
      this.chatMessages.push({ sender: 'You', message: this.message }); // 👈 Store as object
      this.message = ''; // Clear input after sending
    }
  }
}
