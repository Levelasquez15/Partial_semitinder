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
  step = 1;

  // datos
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';
  country = '';
  gender = '';
  birthdate = '';
  passions: string[] = [];
  photos: string[] = []; // aquí guardamos las fotos (base64 o url)

  errorMsg = '';

  constructor(
    private auth: AuthService,
    private firebase: FirebaseService,
    private router: Router
  ) {}

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  togglePassion(p: string) {
    if (this.passions.includes(p)) {
      this.passions = this.passions.filter(x => x !== p);
    } else {
      this.passions.push(p);
    }
  }

  // ✅ Método corregido para input file
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.photos.push(reader.result as string); // guardamos la foto en base64
      };
      reader.readAsDataURL(file);
    }
  }

  async finishRegister() {
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
          gender: this.gender,
          birthdate: this.birthdate,
          passions: this.passions,
          photos: this.photos, // aquí se guarda la lista de fotos
          createdAt: new Date().toISOString()
        });
      }
      this.router.navigate(['/home']);
    } catch (error: any) {
      this.errorMsg = error.message || 'Error al registrarse';
    }
  }
}
