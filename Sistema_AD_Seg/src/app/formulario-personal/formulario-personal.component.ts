import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service'; 
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-formulario-personal',
  templateUrl: './formulario-personal.component.html',
  styleUrl: './formulario-personal.component.css'
})
export class FormularioPersonalComponent {

  username: string = ''; // Inicialmente vacío
  private loggedIn = false;
  usuarios: any[] = [];
  usuariosPersonal: any[] = []; 
  nuevoPersonal: any = {
    id_usuario: "", 
    nombre: '',
    apellido: '', 
    cedula: '',
    sexo:'',
    perfil: '',
    observaciones:'',
    celular:'',
    correo_electronico: '',
  };
 
  validationErrors: any = {};
  cedulaExists: boolean = false;
  correoExists: boolean = false;
  celularExists: boolean = false;


  constructor(private router: Router, private apiService: ApiService ,@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem('username') || 'Invitado';
    };
    this.cargarUsuarios();
  }

/**
 * Nombre de la función: cargarUsuarios
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función carga la lista de usuarios desde el servicio `apiService`. Una vez obtenida la respuesta, filtra
 * los usuarios con perfiles de 'Administracion' y 'Seguridad' y los asigna a la variable `usuariosPersonal`.
 * 
 * @returns void
 */

  cargarUsuarios(): void {
    this.apiService.getUsuarios().subscribe(
      (response) => {
        // Filtrar usuarios con rol de 'Residente'
        this.usuarios = response;
        this.usuariosPersonal = this.usuarios.filter(user => ['Administracion', 'Seguridad'].includes(user.perfil));
      },
      (error) => {
        console.error('Error al obtener usuarios:', error);
      }
    );
  } 

/**
 * Nombre de la función: seleccionarUsuario
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función maneja el evento de selección de un usuario en un elemento `<select>`. Convierte el valor del
 * evento a un número, busca el usuario correspondiente en la lista `usuariosPersonal`, y asigna los datos del 
 * usuario seleccionado a `nuevoPersonal`. Si el usuario no se encuentra, se muestra un mensaje de error en la consola.
 * 
 * @param event - El evento del DOM asociado al cambio de selección del usuario.
 * 
 * @returns void
 */

  seleccionarUsuario(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const id_usuario = Number(target.value);  // Convertir el id_usuario a número
    // Encuentra el usuario seleccionado
    const usuarioSeleccionado = this.usuariosPersonal.find(usuario => usuario.id_usuario === id_usuario);
    if (usuarioSeleccionado) {
      this.nuevoPersonal.id_usuario = usuarioSeleccionado.id_usuario;
      this.nuevoPersonal.nombre = usuarioSeleccionado.nombre;
      this.nuevoPersonal.apellido = usuarioSeleccionado.apellido;
      this.nuevoPersonal.correo_electronico = usuarioSeleccionado.correo_electronico;
    } else {
      console.error('Usuario no encontrado');
    }
  }

/**
 * Nombre de la función: checkCorreoUsuarios
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función valida que el campo de correo electrónico (`correo_electronico`) no esté vacío en el objeto 
 * `nuevoPersonal`. Si el campo está vacío, se agrega un mensaje de error a `validationErrors` indicando que 
 * el correo electrónico es obligatorio.
 * 
 * @returns void
 */

  checkCorreoUsuarios() {
      if (!this.nuevoPersonal.correo_electronico) {
        this.validationErrors.correo_electronico = ['El correo electrónico es obligatorio.'];
        return;
      }
    }

/**
 * Nombre de la función: checkCelularPersonal
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función valida y formatea el número de celular ingresado en el objeto `nuevoPersonal`. Si el campo de 
 * celular está vacío, se agrega un mensaje de error a `validationErrors`. Luego, formatea el número de celular 
 * para que esté en el formato internacional (+593 para Ecuador). A continuación, realiza una solicitud al servicio 
 * para verificar si el número de celular ya está registrado. Si el número de celular ya está registrado, se 
 * agrega un mensaje de error; de lo contrario, se limpia el campo de errores. Si ocurre un error durante la 
 * verificación, se muestra un mensaje de error en la consola y se agrega un mensaje de error a `validationErrors`.
 * 
 * @returns void
 */

  checkCelularPersonal() {
    if (!this.nuevoPersonal.celular) {
      this.validationErrors.celular = ['El número de celular es obligatorio.'];
      return;
    }
    // Formatear el número de celular
    let celular = this.nuevoPersonal.celular;
    if (celular.length === 10 && celular.startsWith('0')) {
      celular = '+593' + celular.substring(1);
    } else if (celular.length === 9) {
      celular = '+593' + celular;
    }
    // Guardar el formato formateado en el objeto nuevoPersonal
    this.nuevoPersonal.celular = celular;
    this.apiService.checkCelularPersonal(celular).subscribe(
      (response) => {
        this.celularExists = response.exists;
        if (this.celularExists) {
          this.validationErrors.celular = ['El número de celular ya está registrado.'];
        } else {
          this.validationErrors.celular = [];
        }
      },
      (error) => {
        console.error('Error al verificar el número de celular:', error);
        this.validationErrors.celular = ['Error al verificar el número de celular.'];
      }
    );
  }

/**
 * Nombre de la función: checkCedulaPersonal
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función valida el número de cédula ecuatoriana ingresado en `nuevoPersonal`. Primero, verifica que el 
 * campo de cédula no esté vacío y que tenga exactamente 10 dígitos. Luego, realiza una validación específica 
 * para cédulas ecuatorianas, verificando la región y el dígito verificador utilizando el algoritmo estándar. 
 * Si la cédula es válida, realiza una solicitud al servicio para verificar si ya está registrada. Si ya está 
 * registrada, agrega un mensaje de error; de lo contrario, limpia los errores. En caso de error durante la 
 * verificación, muestra un mensaje de error en la consola y actualiza los errores de validación.
 * 
 * @returns void
 */

  checkCedulaPersonal() {
  if (!this.nuevoPersonal.cedula) {
    this.validationErrors.cedula = ["Cédula es obligatoria."];
    return;
  }
  // Lógica de validación de cédula ecuatoriana
  const cedula = this.nuevoPersonal.cedula;
  if (cedula.length !== 10) {
    this.validationErrors.cedula = ["La cédula debe tener 10 dígitos."];
    return;
  }
  const digitoRegion = parseInt(cedula.substring(0, 2), 10);
  if (digitoRegion < 1 || digitoRegion > 24) {
    this.validationErrors.cedula = ["Esta cédula no pertenece a ninguna región."];
    return;
  }
  const ultimoDigito = parseInt(cedula.substring(9, 10), 10);
  const pares = parseInt(cedula.substring(1, 2), 10) + parseInt(cedula.substring(3, 4), 10) +
                parseInt(cedula.substring(5, 6), 10) + parseInt(cedula.substring(7, 8), 10);
  const numeroImpar = (num: string) => {
    let n = parseInt(num, 10) * 2;
    return n > 9 ? n - 9 : n;
  };
  const impares = numeroImpar(cedula[0]) + numeroImpar(cedula[2]) + numeroImpar(cedula[4]) +
                  numeroImpar(cedula[6]) + numeroImpar(cedula[8]);
  const sumaTotal = pares + impares;
  const primerDigitoSuma = parseInt(sumaTotal.toString().substring(0, 1), 10);
  const decena = (primerDigitoSuma + 1) * 10;
  let digitoValidador = decena - sumaTotal;
  if (digitoValidador === 10) {
    digitoValidador = 0;
  }
  if (digitoValidador !== ultimoDigito) {
    this.validationErrors.cedula = ["La cédula es incorrecta."];
    return;
  }
  // Si la cédula es válida, verificar si está registrada
  this.apiService.checkCedulaPersonal(this.nuevoPersonal.cedula).subscribe(
    (response) => {
      this.cedulaExists = response.exists;
      if (this.cedulaExists) {
        this.validationErrors.cedula = ["La cédula ya está registrada."];
      } else {
        this.validationErrors.cedula = [];
      }
    },
    (error) => {
      console.error("Error al verificar cédula:", error);
      this.validationErrors.cedula = ["Error al verificar la cédula."];
    }
  );
}

/**
 * Nombre de la función: checkCorreoPersonal
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función valida el correo electrónico ingresado en `nuevoPersonal`. Primero, verifica que el campo de 
 * correo electrónico no esté vacío. Luego, realiza una solicitud al servicio para verificar si el correo 
 * electrónico ya está registrado. Si el correo ya está registrado, agrega un mensaje de error; de lo contrario, 
 * limpia los errores. En caso de error durante la verificación, muestra un mensaje de error en la consola y 
 * actualiza los errores de validación.
 * 
 * @returns void
 */

  checkCorreoPersonal() {
    if (!this.nuevoPersonal.correo_electronico) {
      this.validationErrors.correo_electronico = ['El correo electrónico es obligatorio.'];
      return;
    }
    this.apiService.checkCorreoPersonal(this.nuevoPersonal.correo_electronico).subscribe(
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
 * Nombre de la función: 'guardar'
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * 1. Obtiene el ID de usuario basado en el correo electrónico del nuevo personal.
 * 2. Usa el ID de usuario para crear un nuevo registro de personal.
 * 3. Muestra una alerta de éxito y navega a la página de registro de personal si la creación es exitosa.
 * 4. Muestra una alerta de error en caso de fallos y maneja errores específicos como la validación del formulario.
 */

   guardar(): void {
    this.apiService.getUserIdByEmail(this.nuevoPersonal.correo_electronico).subscribe(
        (response) => {
            this.nuevoPersonal.id_usuario = response.id_usuario;
            this.apiService.createPersonal(this.nuevoPersonal).subscribe(
                (response) => {
                    console.log('Personal creado:', response);
                    Swal.fire({
                        title: 'Éxito',
                        text: 'Personal creado correctamente.',
                        icon: 'success',
                        confirmButtonText: 'Aceptar'
                    }).then(() => {
                        this.router.navigate(['/registro-personal']);
                    });
                },
                (error) => {
                    console.error('Error al crear Personal:', error);
                    Swal.fire({
                        title: 'Error',
                        text: error.status === 422
                            ? 'Por favor, corrija los errores en el formulario.'
                            : 'Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde.',
                        icon: 'error',
                        confirmButtonText: 'Aceptar'
                    });
                }
            );
        },
        (error) => {
            console.error('Error al obtener id_usuario:', error);
            Swal.fire({
                title: 'Error',
                text: 'Error al obtener ID de usuario. Verifique el correo electrónico.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    );
}

/**
 * Nombre de la función: 'logout'
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * 1. Marca al usuario como no autenticado estableciendo `loggedIn` en false.
 * 2. Elimina el nombre de usuario y el rol del almacenamiento local.
 * 3. Redirige al usuario a la página de inicio de sesión.
 */

  logout() {
    this.loggedIn = false;
    localStorage.removeItem('username'); 
    localStorage.removeItem('role'); 
    this.router.navigate(['/login']); 
  }
  
}
