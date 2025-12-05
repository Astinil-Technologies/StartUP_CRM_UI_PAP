import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';  //  must be imported from @angular/common
import { FormsModule } from '@angular/forms';    //  must be imported from @angular/forms

@Component({
  selector: 'app-chatbot',
   standalone: true,  // ✅ Add this line
   imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent {
  messages: { sender: string, text: string }[] = [];
  userInput = '';
  isOpen = true;

  @ViewChild('chatWindow') chatWindow!: ElementRef;

  constructor(private http: HttpClient) {}

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    const message = this.userInput.trim();
    this.messages.push({ sender: 'user', text: message });
    this.userInput = '';

    this.http.post('/api/chatbot', { message },{ responseType: 'text'}).subscribe({
      next: res => {
        this.messages.push({ sender: 'bot', text: res });
        this.scrollToBottom();
      },
      error: () => {
        this.messages.push({ sender: 'bot', text: '⚠️ Unable to reach the server.' });
        this.scrollToBottom();
      }
    });
  }

  private scrollToBottom() {
    setTimeout(() => {
      const element = this.chatWindow?.nativeElement;
      element.scrollTop = element.scrollHeight;
    }, 100);
  }
}

