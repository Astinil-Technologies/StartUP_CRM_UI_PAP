import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { LeaveTypeRequest, LeaveTypeResponse } from 'src/app/models/leave-type.model';

@Injectable({
  providedIn: 'root'
})
export class LeaveTypeService {

  private baseUrl = '/api/leave-types';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<LeaveTypeResponse[]>(this.baseUrl);
  }

  create(payload: LeaveTypeRequest) {
    return this.http.post(this.baseUrl, payload);
  }

  update(id: number, payload: LeaveTypeRequest) {
    return this.http.put(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
