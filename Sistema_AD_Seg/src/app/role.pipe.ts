import { Pipe, PipeTransform } from '@angular/core';

type Role = 'Administracion' | 'Seguridad' | 'Residente';

@Pipe({
  name: 'role'
})
export class RolePipe implements PipeTransform {

  transform(value: any, ...requiredRoles: Role[]): any {
    const userRole = localStorage.getItem('role') as Role | null;

    // Verificar que `userRole` no sea nulo y que esté en la lista de roles requeridos
    console.log('User Role:', userRole);
    console.log('Required Roles:', requiredRoles);

    if (userRole && requiredRoles.includes(userRole)) {
      console.log('Access granted');
      return value; // Permite el valor si el rol está en la lista de roles requeridos
    }

    console.log('Access denied');
    return null; // Oculta el valor si el rol no está en la lista de roles requeridos
  }
  }