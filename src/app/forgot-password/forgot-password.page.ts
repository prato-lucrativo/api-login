import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastController, IonicModule } from '@ionic/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage {
  form: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private toastController: ToastController,
    private http: HttpClient
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async presentToast(message: string, color: string = 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return this.presentToast('Digite um e-mail válido.');
    }

    this.isLoading = true;

    this.http.post<any>('http://localhost:3000/api/forgot-password', this.form.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.presentToast('Verifique seu e-mail para redefinir a senha.', 'success');
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.presentToast(err.error?.message || 'Erro ao enviar link.');
      }
    });
  }
}