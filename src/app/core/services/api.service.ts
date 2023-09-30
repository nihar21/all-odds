// core/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  get<T>(url: string, params?: any) : Observable<T> {
    return this.http.get<T>(url, { params });
  }

  post(url: string, payload?: any) {
    return this.http.post(url, payload);
  }

  // Implement other HTTP methods (put, delete, etc.) similarly
}