import { Injectable, EnvironmentInjector } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, collection, getDocs, limit, query, orderBy } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  constructor(private firestore: Firestore, private env: EnvironmentInjector) {}

  // Guarda datos de usuario
  async saveUserData(uid: string, data: any): Promise<void> {
    await this.env.runInContext(async () => {
      const userRef = doc(this.firestore, `users/${uid}`);
      await setDoc(userRef, data, { merge: true });
    });
  }

  // Obtiene los datos del usuario
  async getUserData(uid: string): Promise<any> {
    return await this.env.runInContext(async () => {
      const userRef = doc(this.firestore, `users/${uid}`);
      const snap = await getDoc(userRef);
      return snap.exists() ? snap.data() : null;
    });
  }

  // Actualiza solo las fotos del usuario
  async updateUserPhotos(uid: string, photoUrls: string[]): Promise<void> {
    await this.env.runInContext(async () => {
      const userRef = doc(this.firestore, `users/${uid}`);
      await setDoc(userRef, { photos: photoUrls }, { merge: true });
    });
  }

  // Lista perfiles (básico): últimos N usuarios creados
  async listProfiles(max: number = 20): Promise<any[]> {
    return await this.env.runInContext(async () => {
      const colRef = collection(this.firestore, 'users');
      try {
        const q = query(colRef, orderBy('createdAt', 'desc'), limit(max));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch {
        const fallbackSnap = await getDocs(colRef);
        const all = fallbackSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        return all.slice(0, max);
      }
    });
  }
}
