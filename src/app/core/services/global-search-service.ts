import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalSearchResponse } from 'src/app/models/global-search-response';

@Injectable({ providedIn: 'root' })
export class globalsearchservice {
  private apiUrl = 'http://localhost:8080/api/search';

  constructor(private http: HttpClient) {}

  globalSearch(keyword: string): Observable<GlobalSearchResponse> {
    return this.http.get<GlobalSearchResponse>(`${this.apiUrl}?keyword=${encodeURIComponent(keyword)}`);
  }
  

}
