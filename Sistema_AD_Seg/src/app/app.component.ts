import { Component, HostListener, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Sistema_AD_Seg';

  private idleTimeout: any;
  private readonly idleLimit = 1800000; // 30 minutos en milisegundos para pruebas

  constructor(
    private router: Router,
    private apiService: ApiService,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.setupIdleTimer();
  }

  // Configura el temporizador de inactividad
  private setupIdleTimer() {
    if (isPlatformBrowser(this.platformId)) {
      this.resetTimer();
      this.setupListeners();
    }
  }

  // Resetea el temporizador al realizar una acción
  private resetTimer() {
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.runOutsideAngular(() => {
        clearTimeout(this.idleTimeout);
        this.idleTimeout = setTimeout(() => this.logout(), this.idleLimit);
      });
    }
  }

  // Configura los listeners para eventos de actividad del usuario
  private setupListeners() {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('mousemove', () => this.resetTimer());
      window.addEventListener('keydown', () => this.resetTimer());
      window.addEventListener('scroll', () => this.resetTimer());
    }
  }

  // Maneja el cierre de sesión por inactividad
  private logout() {
    console.log('Logging out due to inactivity');

    // Limpia datos del localStorage
    localStorage.removeItem('username');
    localStorage.removeItem('role');

    // Llama al endpoint de logout en el backend
    this.apiService.logout().subscribe({
      next: () => {
        console.log('Logged out successfully');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error during logout', err);
        this.router.navigate(['/login']);
      }
    });
  }

  // Método para redirigir al login
  redirectToLogin() {
    this.router.navigate(['/login']);
  }
}
