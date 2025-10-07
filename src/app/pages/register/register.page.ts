import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth';
import { FirebaseService } from 'src/app/core/services/firebase';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';
  country = '';
  errorMsg = '';

  constructor(
    private auth: AuthService,
    private firebase: FirebaseService,
    private router: Router
  ) {}

  async register() {
    if (!this.email || !this.password || !this.confirmPassword || !this.firstName || !this.lastName || !this.country) {
      this.errorMsg = 'Todos los campos son obligatorios';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMsg = 'Las contraseñas no coinciden';
      return;
    }

    try {
      const user = await this.auth.register(this.email, this.password);
      if (user && user.uid) {
        await this.firebase.saveUserData(user.uid, {
          uid: user.uid,
          email: this.email,
          firstName: this.firstName,
          lastName: this.lastName,
          country: this.country,
          city: '',
          gender: '',
          passions: [],
          photos: [],
          createdAt: new Date().toISOString()
        });
      }

      console.log(' Usuario registrado y guardado en Firestore:', user);
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error(' Error en registro:', error);
      this.errorMsg = error.message || 'Error al registrarse';
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
