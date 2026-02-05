import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LeaveBalanceService {
  private http = inject(HttpClient);
  private baseUrl = (environment.baseUrl ?? 'http://localhost:8888') + '/api/leaves/balance';

  private authHeaders(token?: string | null) {
    return token ? { headers: { Authorization: `Bearer ${token}` } as any } : {};
  }

  /** GET /api/leaves/balance/{userId} */
  getBalance(userId: number, token?: string | null): Observable<any> {
    const url = `${this.baseUrl}/${userId}`;
    return this.http.get<any>(url, this.authHeaders(token));
  }

  generateYearly(token?: string | null): Observable<string> {
  const url = `${this.baseUrl}/generate-yearly`;
  return this.http.post(url,{},
    {
      headers: this.authHeaders(token)?.headers,
      responseType: 'text'
    }
  ) as Observable<string>;
}

  /** PUT /api/leaves/balance/update/{employeeId} */
  updateBalance(employeeId: number, payload: any, token?: string | null): Observable<any> {
    const url = `${this.baseUrl}/update/${employeeId}`;
    return this.http.put<any>(url, payload, this.authHeaders(token));
  }

  /** GET /api/leaves/balance/report */
  getReport(token?: string | null): Observable<any> {
    const url = `${this.baseUrl}/report`;
    return this.http.get<any>(url, this.authHeaders(token));
  }
}
