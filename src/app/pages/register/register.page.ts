import { Component } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import FilePicker from 'src/app/core/plugins/FilePicker';
import { Filesystem } from '@capacitor/filesystem';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth';
import { FirebaseService } from 'src/app/core/services/firebase';
import { CountriesService, CountryResponse } from 'src/app/core/services/countries';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';

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
  city = '';
  showGenderProfile = false;
  email = '';
  password = '';
  confirmPassword = '';
  country = '';
  gender = '';
  birthdate = '';
  passions: string[] = [];
  photos: string[] = []; // aquí guardamos las fotos (base64 o url)

  countries: string[] = [];

  errorMsg = '';


  constructor(
    private auth: AuthService,
    private firebase: FirebaseService,
    private router: Router,
    private countriesService: CountriesService,
    private actionSheetCtrl: ActionSheetController
  ) {
    this.loadCountries();
  }

  loadCountries() {
    this.countriesService.getCountries().subscribe({
      next: (res: CountryResponse) => {
        if (!res.error && res.data) {
          this.countries = res.data.map(c => c.name).sort();
        }
      },
      error: () => {
        this.countries = [];
      }
    });
  }

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

  // Método para seleccionar archivo usando el plugin nativo
  async addMedia() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Add media',
      buttons: [
        {
          text: 'Take Photo',
          icon: 'camera',
          handler: () => this.takePhoto()
        },
        {
          text: 'Choose from Gallery',
          icon: 'image',
          handler: () => this.pickFromGallery()
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async pickFromGallery() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos
      });
      if (image.base64String) {
        this.photos.push(`data:image/jpeg;base64,${image.base64String}`);
      } else {
        this.errorMsg = 'No se pudo obtener la imagen de la galería.';
      }
    } catch (err) {
      this.errorMsg = 'No se seleccionó ninguna imagen.';
    }
  }

  async takePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });
      this.photos.push(`data:image/jpeg;base64,${image.base64String}`);
    } catch (err) {
      this.errorMsg = 'No se tomó ninguna foto.';
    }
  }

  // 📸 Método para subir fotos en segundo plano (no bloquea el registro)
  async uploadPhotosInBackground(userId: string) {
    try {
      const storage = getStorage();
      let photoUrls: string[] = [];
      
      for (let i = 0; i < this.photos.length; i++) {
        const base64 = this.photos[i];
        const photoRef = ref(storage, `users/${userId}/photo_${Date.now()}_${i}.jpg`);
        await uploadString(photoRef, base64, 'data_url');
        const url = await getDownloadURL(photoRef);
        photoUrls.push(url);
      }
      
      // Actualizar el documento del usuario con las URLs de las fotos
      await this.firebase.updateUserPhotos(userId, photoUrls);
      
    } catch (error: any) {
      console.error('Error subiendo fotos en segundo plano:', error);
      // No mostrar error al usuario, solo log
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
      this.errorMsg = 'Creando cuenta...';
      const user = await this.auth.register(this.email, this.password);
      
      if (user && user.uid) {
        this.errorMsg = 'Guardando datos del perfil...';
        
        // 📋 Guardar solo datos personales del usuario
        const userData: any = {
          name: this.firstName,
          lastName: this.lastName,
          birthDate: this.birthdate,
          email: this.email,
          password: this.password,
          country: this.country,
          city: this.city || '',
          gender: this.gender,
          showGenderProfile: this.showGenderProfile,
          passions: Array.isArray(this.passions) && typeof this.passions[0] === 'object'
            ? this.passions
            : this.passions.map(p => ({ category: p })),
          createdAt: new Date().toISOString()
        };
        
        await this.firebase.saveUserData(user.uid, userData);
        this.errorMsg = 'Perfil guardado ✓';
        
        this.errorMsg = 'Registro completado! Redirigiendo...';
        
        // 📸 Intentar subir fotos en segundo plano (no bloquear el registro)
        if (this.photos.length > 0) {
          this.uploadPhotosInBackground(user.uid);
        }
        
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1000);
      }
    } catch (error: any) {
      this.errorMsg = 'ERROR: ' + (error.message || error.toString());
    }
  }
}
