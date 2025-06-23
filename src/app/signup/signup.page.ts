import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  imports: [
    IonicModule,
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule
  ]
})
export class SignupPage {
  signupForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private toastController: ToastController,
    private http: HttpClient,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', Validators.required]
    }, { validators: this.senhasConfere });
  }

  senhasConfere(group: FormGroup) {
    const senha = group.get('senha')?.value;
    const confirmarSenha = group.get('confirmarSenha')?.value;
    return senha === confirmarSenha ? null : { senhasDiferentes: true };
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
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return this.presentToast('Preencha corretamente todos os campos.');
    }

    this.isLoading = true;

    const { nome, email, senha } = this.signupForm.value;

    this.http.post<any>('http://192.168.2.12:3000/api/signup', { nome, email, senha }).subscribe({
      next: async (res) => {
        this.isLoading = false;
        if (res.success) {
          await this.presentToast('Cadastro efetuado com sucesso!', 'success');
          this.router.navigate(['/login']);
        } else {
          await this.presentToast(res.message || 'Erro ao cadastrar usuário.');
        }
      },
      error: async (err) => {
        this.isLoading = false;
        console.error(err);
        await this.presentToast('Erro ao conectar com o servidor.');
      }
    });
  }
}
