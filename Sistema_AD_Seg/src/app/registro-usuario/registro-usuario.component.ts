import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service'; 
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro-usuario',
  templateUrl: './registro-usuario.component.html',
  styleUrl: './registro-usuario.component.css'
})
export class RegistroUsuarioComponent {

  username: string = ''; // Inicialmente vacío
  private loggedIn = false;
    nuevoUsuario: any = {
    correo_electronico: '',
    contrasena: '',
    nombre: '',
    apellido: '',
    username: '',
    perfil: '',
    rol:''
  };

  validationErrors: any = {};
  correoExists: boolean = false;
  usernameExists: boolean = false;

  constructor(private router: Router, private apiService: ApiService ,@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem('username') || 'Invitado';
    };
  }

/**
 * Nombre de la función: `checkCorreoUsuarios`
 * Autor: Freya López - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función verifica si el correo electrónico proporcionado en `nuevoUsuario` ya está registrado en el sistema. 
 * Si el correo electrónico está vacío, se añade un error de validación indicando que es obligatorio.
 * Si el correo electrónico ya está registrado, se actualiza el objeto `validationErrors` con un mensaje de error.
 * Si ocurre un error durante la verificación, se muestra un mensaje de error en la consola y se actualiza el objeto 
 * `validationErrors` con un mensaje de error genérico.
 */

  checkCorreoUsuarios() {
    if (!this.nuevoUsuario.correo_electronico) {
      this.validationErrors.correo_electronico = ['El correo electrónico es obligatorio.'];
      return;
    }
    this.apiService.checkCorreoUsuarios(this.nuevoUsuario.correo_electronico).subscribe(
      (response) => {
        this.correoExists = response.exists;
        if (this.correoExists) {
          this.validationErrors.correo_electronico = ['El correo electrónico ya está registrado.'];
        } else {
          this.validationErrors.correo_electronico = [];
        }
      },
      (error) => {
        console.error('Error al verificar correo electrónico:', error);
        this.validationErrors.correo_electronico = ['Error al verificar el correo electrónico.'];
      }
    );
  }

/**
 * Nombre de la función: `checkUsernameUsuarios`
 * Autor: Freya López - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función verifica si el nombre de usuario proporcionado en `nuevoUsuario` ya está registrado en el sistema. 
 * Si el nombre de usuario está vacío, se muestra una alerta indicando que es obligatorio.
 * Si el nombre de usuario ya está registrado, se muestra una alerta indicando que el nombre de usuario ya está en uso.
 * Si ocurre un error durante la verificación, se muestra una alerta con un mensaje de error genérico.
 */

checkUsernameUsuarios() {
  if (!this.nuevoUsuario.username) {
    Swal.fire({
      title: 'Error',
      text: 'El Nombre de Usuario es obligatorio.',
      icon: 'error',
      confirmButtonText: 'Aceptar'
    });
    return;
  }
  this.apiService.checkUsernameUsuarios(this.nuevoUsuario.username).subscribe(
    (response) => {
      if (response.exists) {
        Swal.fire({
          title: 'Error',
          text: 'El Nombre de Usuario ya está registrado.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    },
    (error) => {
      Swal.fire({
        title: 'Error',
        text: 'Error al verificar el Nombre de Usuario.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  );
}

/**
 * Nombre de la función: `updateRol`
 * Autor: Freya López - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función actualiza el rol del usuario (`nuevoUsuario.rol`) basado en el perfil seleccionado (`nuevoUsuario.perfil`).
 * Dependiendo del valor del perfil, se asigna un rol específico:
 * - 'Residente' o 'Propietario' se asigna el rol 'Residente'.
 * - 'Administracion' se asigna el rol 'Administracion'.
 * - 'Seguridad' se asigna el rol 'Seguridad'.
 * Si el perfil no coincide con ninguno de los valores esperados, se asigna un rol vacío.
 */

  updateRol() {
    const perfil = this.nuevoUsuario.perfil;
    if (perfil === 'Residente' || perfil === 'Propietario') {
      this.nuevoUsuario.rol = 'Residente';
    } else if (perfil === 'Administracion') {
      this.nuevoUsuario.rol = 'Administracion';
    } else if (perfil === 'Seguridad') {
      this.nuevoUsuario.rol = 'Seguridad';
    } else {
      this.nuevoUsuario.rol = '';  
    }
  }

/**
 * Nombre de la función: `guardar`
 * Autor: Freya López - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función maneja el proceso de creación de un nuevo usuario. Primero, valida que la contraseña tenga al menos 8 caracteres. Si la validación falla, muestra un mensaje de error y detiene el proceso.
 * Si la validación es exitosa, envía los datos del nuevo usuario al servidor a través del servicio `apiService.createUsuario`. 
 * En caso de éxito, muestra un mensaje de confirmación y redirige a la página de gestión de usuarios.
 * En caso de error, maneja diferentes tipos de errores:
 * - Si el error es de validación (código 422), muestra mensajes específicos según el tipo de error (por ejemplo, nombre de usuario ya ocupado).
 * - Para otros errores, muestra un mensaje general de error inesperado.
 */
  
  Guardar() {
    // Validar longitud de la contraseña en el frontend
    if (this.nuevoUsuario.contrasena.length < 8) {
      this.validationErrors.contrasena = ['La contraseña debe tener al menos 8 caracteres.'];
      Swal.fire({
        title: 'Error',
        text: 'La contraseña debe tener al menos 8 caracteres.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
  
    this.apiService.createUsuario(this.nuevoUsuario).subscribe(
      (response) => {
        console.log('Usuario creado:', response);
        Swal.fire({
          title: 'Éxito',
          text: 'Usuario creado con éxito.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          // Redirige a la página de gestión de usuarios después de mostrar el mensaje
          this.router.navigate(['/gestionusuario']);
        });
      },
      (error) => {
        console.error('Error al crear usuario:', error);
        if (error.status === 422) {
          this.validationErrors = error.error.errors;
          // Manejar el caso específico del nombre de usuario ya ocupado
          if (error.error.errors && error.error.errors.username) {
            Swal.fire({
              title: 'Error',
              text: 'Nombre de usuario ya ocupado.',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          } else {
            Swal.fire({
              title: 'Error',
              text: 'Por favor, corrija los errores en el formulario.',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          }
        } else {
          Swal.fire({
            title: 'Error',
            text: 'Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      }
    );
  }

  logout() {
    this.loggedIn = false;
    localStorage.removeItem('username'); // Limpiar nombre de usuario del localStorage
    localStorage.removeItem('role'); // Limpiar rol del localStorage
    this.router.navigate(['/login']); // Redirige a la página de inicio de sesión
  }
  

}
