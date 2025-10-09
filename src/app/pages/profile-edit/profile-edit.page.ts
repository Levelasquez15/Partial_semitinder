import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth';
import { FirebaseService } from 'src/app/core/services/firebase';
import { ActionSheetController, ToastController, AlertController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Supabase } from 'src/app/core/services/supabase';
import { environment } from 'src/environments/environment';
import { CountriesService, CountryResponse } from 'src/app/core/services/countries';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.page.html',
  styleUrls: ['./profile-edit.page.scss'],
  standalone:false
})
export class ProfileEditPage implements OnInit {
  loading = true;
  errorMsg = '';
  user: any = {};
  photos: string[] = [];
  passionsChips: string[] = [];
  countries: string[] = [];

  constructor(
    private auth: AuthService,
    private firebase: FirebaseService,
    private supabase: Supabase,
    private actionSheetCtrl: ActionSheetController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private countriesService: CountriesService
  ) { }

  async ngOnInit() {
    // Cargar perfil y países en paralelo
    await Promise.all([this.loadUserProfile(), this.loadCountries()]);
  }

  async loadUserProfile() {
    this.loading = true;
    this.errorMsg = '';
    try {
      const u = this.auth.getCurrentUser();
      if (!u?.uid) throw new Error('No hay sesión activa');
      this.user = (await this.firebase.getUserData(u.uid)) || { name: '', lastName: '', country: '', passions: [], photos: [] };
      this.photos = Array.isArray(this.user?.photos) ? this.user.photos : [];
      this.passionsChips = this.normalizePassions(this.user);
    } catch (e: any) {
      this.errorMsg = e?.message || 'No se pudo cargar tu perfil';
    } finally {
      this.loading = false;
    }
  }

  private async loadCountries() {
    return new Promise<void>((resolve) => {
      this.countriesService.getCountries().subscribe({
        next: (res: CountryResponse) => {
          if (!res.error && res.data) {
            this.countries = res.data.map(c => c.name).sort();
          } else {
            this.countries = [];
          }
          resolve();
        },
        error: () => { this.countries = []; resolve(); }
      });
    });
  }

  private normalizePassions(user: any): string[] {
    // soporta: ['Música','Viajar'] o [{category:'Música'}] o user.selectedPassions
    const arr = user?.passions ?? user?.selectedPassions ?? [];
    if (!Array.isArray(arr)) return [];
    if (arr.length === 0) return [];
    return typeof arr[0] === 'object' ? arr.map((x: any) => x?.category).filter(Boolean) : arr.filter(Boolean);
  }

  onCountryChange(ev: CustomEvent) {
    const value = (ev.detail as any)?.value || '';
    this.user = { ...(this.user || {}), country: value };
    this.saveField('country');
  }

  async onAddMedia() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Add media',
      buttons: [
        {
          text: 'Take Photo',
          icon: 'camera',
          handler: () => this.pickPhoto(CameraSource.Camera)
        },
        {
          text: 'Choose from Gallery',
          icon: 'image',
          handler: () => this.pickPhoto(CameraSource.Photos)
        },
        { text: 'Cancel', icon: 'close', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  async pickPhoto(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source
      });
      if (!image.dataUrl) return;
      const resp = await fetch(image.dataUrl);
      const blob = await resp.blob();

      const uid = this.auth.getCurrentUser()?.uid;
      if (!uid) throw new Error('No hay sesión activa');

  const url = await this.supabase.uploadPhoto(blob, environment.supabaseBucket || 'imagnes', uid);
      // Fallback al environment importado por otros sitios (en runtime)
      if (!url) throw new Error('No se pudo subir la foto');

      const updated = [...this.photos, url];
      await this.firebase.updateUserPhotos(uid, updated);
      this.photos = updated;
      this.toast('Foto agregada');
    } catch (e: any) {
      this.toast(e?.message || 'Error al agregar foto', 'danger');
    }
  }

  async toast(message: string, color: 'success' | 'danger' = 'success') {
    const t = await this.toastCtrl.create({ message, duration: 2000, color });
    await t.present();
  }

  // Guardar cambios de campos simples al salir del input
  async saveField(field: 'name' | 'lastName' | 'country') {
    try {
      const uid = this.auth.getCurrentUser()?.uid;
      if (!uid) return;
      const payload: any = { [field]: this.user?.[field] || '' };
      await this.firebase.saveUserData(uid, payload);
      this.toast('Guardado');
    } catch (e) {
      // noop
    }
  }

  // Agregar una pasión con prompt
  async addPassion() {
    const alert = await this.alertCtrl.create({
      header: 'Agregar pasión',
      inputs: [{ name: 'p', type: 'text', placeholder: 'Ej: Música' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Agregar',
          handler: async (data) => {
            const val = (data?.p || '').trim();
            if (!val) return;
            const uid = this.auth.getCurrentUser()?.uid;
            if (!uid) return;
            const list = Array.isArray(this.user?.passions) ? this.user.passions : (Array.isArray(this.user?.selectedPassions) ? this.user.selectedPassions : []);
            const normalizedStore = typeof list[0] === 'object' ? [...list, { category: val }] : [...list, val];
            await this.firebase.saveUserData(uid, { passions: normalizedStore });
            this.user.passions = normalizedStore;
            this.passionsChips = this.normalizePassions(this.user);
          }
        }
      ]
    });
    await alert.present();
  }

}
