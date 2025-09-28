import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth) {}

  // 👉 Registrar usuario
  register(email: string, password: string): Observable<User> {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password).then(res => res.user)
    );
  }

  // 👉 Iniciar sesión
  login(email: string, password: string): Observable<User> {
    return from(
      signInWithEmailAndPassword(this.auth, email, password).then(res => res.user)
    );
  }

  // 👉 Cerrar sesión
  logout(): Observable<void> {
    return from(signOut(this.auth));
  }

  // 👉 Obtener usuario actual
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }
}
