import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "../api.service";
import { PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import * as XLSX from "xlsx";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro-alicuotas',
  templateUrl: './registro-alicuotas.component.html',
  styleUrl: './registro-alicuotas.component.css'
})
export class RegistroAlicuotasComponent {
  
  username: string = ""; // Inicialmente vacío
  p: number = 1; // Página actual de paginacion
  private loggedIn = false;
  filtro: string = "";

  nuevoAlicuota: any = {
    id_residente: null,
    fecha: '',
    mes: '',
    monto_por_cobrar: null
  };

  validationErrors: any = {};
  residentes: any[] = []; // Lista de residentes

  constructor(private router: Router, private apiService: ApiService ,@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem('username') || 'Invitado';
    };
    this.loadResidentes(); // Cargar residentes al inicializar el componente
  }

/**
 * Nombre de la función: `loadResidentes`
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función carga la lista de residentes desde el servicio API y actualiza el estado del componente 
 * con la información obtenida. Se obtiene una lista de residentes y se procesa cada uno para incluir 
 * datos básicos como el nombre y el apellido del residente. Si el nombre o apellido del residente no 
 * está disponible, se asigna un valor por defecto. 
 * 
 * Detalles:
 * - Llama al servicio `getResidentes` para obtener los datos de los residentes.
 * - Mapea la respuesta para incluir `id_residente`, `nombre` y `apellido`, con valores predeterminados 
 *   cuando los datos no están disponibles.
 * - Maneja errores de la solicitud mostrando un mensaje en la consola.
 */

  loadResidentes(): void {
    this.apiService.getResidentes().subscribe(
      (data: any[]) => {
        this.residentes = data.map(residente => ({
          id_residente: residente.id_residente,
          nombre: residente.usuario ? residente.usuario.nombre : 'Nombre no disponible',
          apellido: residente.usuario ? residente.usuario.apellido : 'Apellido no disponible'
        }));
      },
      (error) => {
        console.error('Error al obtener residentes:', error);
      }
    );
  }

  guardar(): void {
    this.apiService.createAlicuota(this.nuevoAlicuota).subscribe(
        (response) => {
            Swal.fire({
                title: 'Éxito',
                text: 'La alícuota ha sido creada correctamente.',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            }).then(() => {
                this.router.navigate(['alicuotas']);
            });
        },
        (error) => {
            console.error('Error al crear Alicuota:', error);
            Swal.fire({
                title: 'Error',
                text: error.status === 422
                    ? 'Por favor, corrija los errores en el formulario.'
                    : 'Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
            if (error.status === 422) {
                this.validationErrors = error.error.errors;
            } else {
                this.validationErrors = { general: 'Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde.' };
            }
        }
    );
}

/**
 * Nombre de la función: `guardar`
 * Autor: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función maneja la creación de una nueva alícuota mediante una solicitud al servicio API. 
 * Si la creación es exitosa, muestra un mensaje de éxito y redirige al usuario a la lista de alícuotas. 
 * En caso de error, muestra un mensaje de error adecuado y maneja los errores de validación si es necesario.
 * 
 * Detalles:
 * - Llama al servicio `createAlicuota` para crear una nueva alícuota con los datos de `nuevoAlicuota`.
 * - Muestra un mensaje de éxito utilizando `Swal.fire` si la creación es exitosa, y luego redirige 
 *   al usuario a la página de alícuotas.
 * - Maneja errores de la solicitud mostrando un mensaje de error con `Swal.fire`. 
 *   Si el error es de validación (estado 422), actualiza `validationErrors` con los errores específicos.
 *   Para otros errores, muestra un mensaje genérico de error.
 */

  onDateChange(event: any): void {
   const selectedDate = new Date(event.target.value);
   const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
   ];
   const monthIndex = selectedDate.getMonth(); // Obtén el índice del mes
   this.nuevoAlicuota.mes = monthNames[monthIndex]; // Asigna el nombre del mes al campo correspondiente
  }


  logout() {
    this.loggedIn = false;
    localStorage.removeItem('username'); 
    this.router.navigate(['/login']); 
  }

}
