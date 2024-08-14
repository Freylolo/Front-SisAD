import { CanActivateFn } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

type Role = 'Administracion' | 'Seguridad' | 'Residente';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Verificar que estamos en el navegador
  if (!isPlatformBrowser(platformId)) {
    return false;
  }

  const role = localStorage.getItem('role') as Role | null;
  const url = state.url;

  console.log(`Role: ${role}, URL: ${url}`);

  if (role && hasPermission(role, url)) {
    console.log('Access granted');
    return true; // Permite el acceso
  } else {
    console.log('Access denied');
    router.navigate(['/access-denied']); // Redirige si no tiene el rol necesario
    return false;
  }

  function hasPermission(role: Role, url: string): boolean {
    const rolePermissions: Record<Role, string[]> = {
      Administracion: ['*'], // Acceso a todas las rutas
      Seguridad: ['/registro-control', '/formulario-control', '/eventos', '/lector-qr','/registro-residentes','/notificaciones','/alicuotas'],
      Residente: ['/registro-evento', '/registro-visitantes', '/eventos', '/alicuotas']
    };

    const permissions = rolePermissions[role];
    console.log(`Permissions for role ${role}: ${permissions}`);
  
    if (permissions) {
      return permissions.includes('*') || permissions.some(permission => url.startsWith(permission));
    }
  
    return false;
  }
};
