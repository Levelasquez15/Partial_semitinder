import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private router: Router) {
    // Cuando navegamos, quita el foco del elemento activo para evitar conflictos con aria-hidden de la página anterior
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      const active = document.activeElement as HTMLElement | null;
      if (active && typeof active.blur === 'function') {
        active.blur();
      }
    });
  }
}
