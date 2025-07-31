import { Injectable } from '@angular/core';
import * as Stomp from 'stompjs';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  send(arg0: string, arg1: { type: string; sender: string; }) {
    throw new Error('Method not implemented.');
  }
  sendChatMessage(meetingId: string, message: any) {
    throw new Error('Method not implemented.');
  }
  private stompClient: Stomp.Client | undefined;
  private connected = false;
  private messageSubject = new Subject<any>();
  private currentRoomId: string = '';

  connect(roomId: string): void {
    if (this.connected) return;

    const socket = new WebSocket('ws://localhost:8080/ws');
    this.stompClient = Stomp.over(socket);
    this.currentRoomId = roomId;

    this.stompClient.connect({}, () => {
      this.connected = true;
      console.log('🟢 WebSocket connected');

      if (this.stompClient) {
        this.stompClient.subscribe(`/topic/signal/${roomId}`, (message) => {
          if (message.body) {
            this.messageSubject.next(JSON.parse(message.body));
          }
        });
      }
    }, (error) => {
      console.error('WebSocket error:', error);
    });
  }

  // 🔧 Fix for: onSignal() expected to return Observable
  onSignal(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  // 🔧 Add sendSignal() as used in video-call.component.ts
  sendSignal(payload: any, p0: { type: string; sender: string; }): void {
    if (this.connected && this.stompClient && this.currentRoomId) {
      this.stompClient.send(`/app/signal/${this.currentRoomId}`, {}, JSON.stringify(payload));
    } else {
      console.error('WebSocket not connected or roomId missing');
    }
  }

  disconnect(): void {
    if (this.connected && this.stompClient) {
      this.stompClient.disconnect(() => {
        console.log('🔴 WebSocket disconnected');
        this.connected = false;
        this.currentRoomId = '';
      });
    }
  }
}
