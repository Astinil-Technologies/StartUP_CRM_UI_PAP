import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TimesheetRequest } from 'src/app/models/timesheet-request.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl +'/timesheet';
  submitTimesheet(data: TimesheetRequest): Observable<string> {
    return this.http.post(`${this.baseUrl}/submit`, data, { responseType: 'text' });
  }
}
