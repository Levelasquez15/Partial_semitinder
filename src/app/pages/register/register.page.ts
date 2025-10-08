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
    this.errorMsg = '';
    if (this.step === 1) {
      if (!this.firstName || !this.lastName || !this.email || !this.password || !this.confirmPassword || !this.country) {
        this.errorMsg = 'Por favor completa todos los campos.';
        return;
      }
      // Validación de email simple
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.email)) {
        this.errorMsg = 'El email no es válido.';
        return;
      }
      if (this.password.length < 6) {
        this.errorMsg = 'La contraseña debe tener al menos 6 caracteres.';
        return;
      }
      if (this.password !== this.confirmPassword) {
        this.errorMsg = 'Las contraseñas no coinciden.';
        return;
      }
    }
    if (this.step === 2) {
      if (!this.gender) {
        this.errorMsg = 'Selecciona tu género.';
        return;
      }
    }
    if (this.step === 3) {
      if (!this.birthdate) {
        this.errorMsg = 'Selecciona tu fecha de nacimiento.';
        return;
      }
    }
    if (this.step === 4) {
      if (this.passions.length === 0) {
        this.errorMsg = 'Selecciona al menos una pasión.';
        return;
      }
    }
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
    this.errorMsg = '';
    // Validar que todos los campos estén completos antes de enviar
    if (!this.firstName || !this.lastName || !this.email || !this.password || !this.confirmPassword || !this.country || !this.gender || !this.birthdate || this.passions.length === 0) {
      this.errorMsg = 'Por favor completa todos los campos.';
      return;
    }
    if (this.photos.length === 0) {
      this.errorMsg = 'Debes subir al menos una foto.';
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.email)) {
      this.errorMsg = 'El email no es válido.';
      return;
    }
    if (this.password.length < 6) {
      this.errorMsg = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMsg = 'Las contraseñas no coinciden.';
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
