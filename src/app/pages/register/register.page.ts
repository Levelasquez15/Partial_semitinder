import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMsg: string = '';

  constructor(private auth: AuthService, private router: Router) {}

  async register() {
    if (this.password !== this.confirmPassword) {
      this.errorMsg = 'Las contraseñas no coinciden';
      return;
    }

    try {
      const user = await this.auth.register(this.email, this.password);
      console.log('Usuario registrado:', user);
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Error en registro', error);
      this.errorMsg = error.message || 'Error al registrarse';
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
