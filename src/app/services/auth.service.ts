import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl; // certifique que no environment é apiUrl

  constructor(private http: HttpClient) {}

  login(email: string, senha: string) {
    return this.http.post(`${this.apiUrl}/login`, { email, senha });
  }

  signup(nome: string, email: string, senha: string) {
    return this.http.post(`${this.apiUrl}/signup`, { nome, email, senha });
  }

  forgotPassword(email: string) {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, senha: string) {
    return this.http.post(`${this.apiUrl}/reset-password/${token}`, { senha });
  }
}
