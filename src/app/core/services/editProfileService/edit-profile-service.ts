import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EditProfileService {

  constructor(private http: HttpClient) { }

  getUserProfile():Observable<any> {
    const url = "http://localhost:8080/api/v1/users/profile"
    return this.http.get(url)
  }

  updateUserProfile(user:any):Observable<any> {
    const url = "http://localhost:8080/api/v1/users/update-profile"
    return this.http.post(url,user)
  }
}
