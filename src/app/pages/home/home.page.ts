import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/core/services/firebase';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone:false
})
export class HomePage implements OnInit {
  loading = true;
  errorMsg = '';
  profiles: any[] = [];
  currentIndex = 0;

  constructor(private firebase: FirebaseService, private router: Router) { }

  async ngOnInit() {
    await this.loadProfiles();
  }

  async loadProfiles() {
    this.loading = true;
    this.errorMsg = '';
    try {
      this.profiles = await this.firebase.listProfiles(20);
      this.currentIndex = 0;
    } catch (e: any) {
      this.errorMsg = e?.message || 'No se pudieron cargar perfiles.';
    } finally {
      this.loading = false;
    }
  }

  get currentProfile() {
    return this.profiles[this.currentIndex];
  }

  onDislike() {
    if (this.currentIndex < this.profiles.length - 1) {
      this.currentIndex++;
    }
  }

  onSuperLike() {
    if (this.currentIndex < this.profiles.length - 1) {
      this.currentIndex++;
    }
  }

  onLike() {
    if (this.currentIndex < this.profiles.length - 1) {
      this.currentIndex++;
    }
  }

  openProfileDetail() {
    const p = this.currentProfile;
    if (p?.id) {
      this.router.navigate(['/profile', p.id]);
    }
  }

  goToProfileEdit() {
    this.router.navigate(['/profile-edit']);
  }

}
