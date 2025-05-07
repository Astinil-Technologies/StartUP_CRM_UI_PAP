import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reminder } from 'src/app/models/reminder.model';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private baseUrl = '/api/reminders';

  constructor(private http: HttpClient) {}

  getReminders(): Observable<Reminder[]> {
    return this.http.get<Reminder[]>(this.baseUrl);
  }

  createReminder(reminder: Reminder): Observable<Reminder> {
    return this.http.post<Reminder>(this.baseUrl, reminder);
  }

  updateReminder(id: number, reminder: Reminder): Observable<Reminder> {
    return this.http.put<Reminder>(`${this.baseUrl}/${id}`, reminder);
  }

  deleteReminder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
