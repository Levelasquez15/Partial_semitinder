import { Injectable, NgZone, EnvironmentInjector } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private auth: Auth, private firestore: Firestore, private zone: NgZone, private env: EnvironmentInjector) {}

  // 👉 Registrar usuario + guardar en Firestore
  async register(email: string, password: string) {
    try {
  const res = await this.env.runInContext(() => createUserWithEmailAndPassword(this.auth, email, password));
      const user = res.user;

      // Crear documento del usuario
      const userRef = doc(this.firestore, `users/${user.uid}`);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        createdAt: new Date()
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  // 👉 Iniciar sesión
  async login(email: string, password: string) {
    try {
  const res = await this.env.runInContext(() => signInWithEmailAndPassword(this.auth, email, password));
      return res.user;
    } catch (error) {
      throw error;
    }
  }

  // 👉 Cerrar sesión
  logout(): Promise<void> {
    return this.env.runInContext(() => signOut(this.auth));
  }

  // 👉 Obtener usuario actual
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }
}
