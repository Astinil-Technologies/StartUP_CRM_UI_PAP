import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  EventEmitter,
  Output,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebSocketService } from 'src/app/core/services/websocket.service';
import { Subscription } from 'rxjs';
import { UserDataService } from 'src/app/core/services/user-data.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() roomId!: string;
  @Input() username: string = 'Guest';
  @Input() messages: { sender: string; content: string; timestamp?: Date }[] = [];
  @Output() messageSent = new EventEmitter<any>();

  @ViewChild('chatMessagesContainer') private chatContainer!: ElementRef;

  // Use centralized WebSocket service instead of using a separate STOMP client
  newMessage: string = '';
  private chatSubscription?: Subscription;

  constructor(private userDataService: UserDataService, private websocketService: WebSocketService) {}

  ngOnInit(): void {
    const userData = this.userDataService.getCurrentUserData();
    if (userData?.username) {
      this.username = userData.username;
    }

    const storedMessages = localStorage.getItem(`chat_${this.roomId}`);
    if (storedMessages) {
      this.messages = JSON.parse(storedMessages);
    }

    // Connect via WebSocketService and listen for chat messages
    this.websocketService.connect(this.roomId);
    this.chatSubscription = this.websocketService.onChatMessage().subscribe((msg: any) => {
      try {
        const body = typeof msg === 'string' ? JSON.parse(msg) : msg;
        if (body && body.sender && body.message) {
          const chatMsg = {
            sender: body.sender,
            content: body.message,
            timestamp: new Date(body.timestamp || Date.now())
          };
          // Avoid duplicates if message already present (optimistic local echo)
          const duplicate = this.messages.some(m => m.sender === chatMsg.sender && m.content === chatMsg.content && Math.abs(new Date(m.timestamp || 0).getTime() - chatMsg.timestamp.getTime()) < 2000);
          if (!duplicate) {
            this.messages.push(chatMsg);
          }
          localStorage.setItem(`chat_${this.roomId}`, JSON.stringify(this.messages));
          this.scrollToBottom();
        } else {
          console.warn('Malformed chat message received:', body);
        }
      } catch (err) {
        console.error('Failed to parse chat message', err);
      }
    });
  }

  ngAfterViewInit(): void {
    // Initial scroll if messages already loaded
    setTimeout(() => this.scrollToBottom(), 100);
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    const msg = {
      sender: this.username,
      message: this.newMessage,
      timestamp: new Date().toISOString()
    };

    // Optimistically add message to UI to give instant feedback, then send
    const optimistic = { sender: msg.sender, content: msg.message, timestamp: new Date(msg.timestamp) };
    this.messages.push(optimistic);
    localStorage.setItem(`chat_${this.roomId}`, JSON.stringify(this.messages));
    this.scrollToBottom();

    if (!this.websocketService.isConnected()) {
      console.warn('WebSocket not connected. Attempting to reconnect and send.');
      this.websocketService.connect(this.roomId);
      // Try to send after a short delay to let the connection establish
      setTimeout(() => {
        console.log('[Chat] Sending message after reconnect attempt', msg);
        this.websocketService.sendChatMessage(this.roomId, msg);
      }, 500);
    } else {
      console.log('[Chat] Sending message', msg);
      this.websocketService.sendChatMessage(this.roomId, msg);
    }

    // Emit event for parent (optional)
    this.messageSent.emit({ ...msg });

    this.newMessage = '';
  }

  scrollToBottom(): void {
    if (this.chatContainer) {
      try {
        setTimeout(() => {
          this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
        }, 100);
      } catch (err) {
        console.warn('Scroll failed:', err);
      }
    }
  }

  ngOnDestroy(): void {
    // Don't disconnect the shared WebSocket from here; the meeting-level
    // component handles connection lifecycle so it stays consistent.

    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }

    localStorage.setItem(`chat_${this.roomId}`, JSON.stringify(this.messages));
  }
}
