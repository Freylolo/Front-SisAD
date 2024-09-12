import { Pipe, PipeTransform } from '@angular/core';

type Role = 'Administracion' | 'Seguridad' | 'Residente';

@Pipe({
  name: 'role'
})
export class RolePipe implements PipeTransform {

  transform(value: any, ...requiredRoles: Role[]): any {
    const userRole = localStorage.getItem('role') as Role | null;
    if (userRole && requiredRoles.includes(userRole)) {
      return value; // Permite el valor si el rol está en la lista de roles requeridos
    }

    return null; // Oculta el valor si el rol no está en la lista de roles requeridos
  }
  }