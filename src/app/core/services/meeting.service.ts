import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MeetingDto } from 'src/app/models/MeetingDto.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  private apiUrl = environment.baseUrl + '/api/v1/meetings';

  constructor(private http: HttpClient) {}

  createMeeting(dto: MeetingDto): Observable<MeetingDto> {
    return this.http.post<MeetingDto>(this.apiUrl, dto);
  }

  joinMeeting(meetingId: string, userId: number): Observable<MeetingDto> {
    const params = new HttpParams().set('userId', userId);
    return this.http.post<MeetingDto>(`${this.apiUrl}/${meetingId}/join`, null, { params });
  }

  getUpcomingMeetings(userId: number): Observable<MeetingDto[]> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<MeetingDto[]>(`${this.apiUrl}/upcoming`, { params });
  }

  getPastMeetings(userId: number): Observable<MeetingDto[]> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<MeetingDto[]>(`${this.apiUrl}/history`, { params });
  }

  updateMeeting(id: number, dto: MeetingDto): Observable<MeetingDto> {
    return this.http.put<MeetingDto>(`${this.apiUrl}/${id}`, dto);
  }

  deleteMeeting(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  lockMeeting(meetingId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${meetingId}/lock`, null);
  }

  kickUser(meetingId: string, userId: number): Observable<void> {
    const params = new HttpParams().set('userId', userId);
    return this.http.post<void>(`${this.apiUrl}/${meetingId}/kick`, null, { params });
  }
}
