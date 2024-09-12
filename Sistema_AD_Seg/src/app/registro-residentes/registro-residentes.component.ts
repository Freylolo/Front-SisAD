import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "../api.service";
import { PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import * as XLSX from "xlsx";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { EditarResidenteDialogoComponent } from '../editar-residente-dialogo/editar-residente-dialogo.component';
import { ChangeDetectorRef } from '@angular/core';
 
@Component({
  selector: 'app-registro-residentes',
  templateUrl: './registro-residentes.component.html',
  styleUrl: './registro-residentes.component.css'
})
export class RegistroResidentesComponent implements OnInit {
  
  username: string = ""; // Inicialmente vacío
  p: number = 1; // Página actual de paginacion
  private loggedIn = false;
  filtro: string = "";

  residentes: any[] = [];

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem('username') || 'Invitado';
      this.apiService.getResidentes().subscribe((data: any) => {
        this.residentes = data.map((residente: any) => ({
          ...residente,
          placas: [residente.vehiculo1_placa, residente.vehiculo2_placa, residente.vehiculo3_placa].filter(placa => placa).join(', '),
          observacionesVehicular: [residente.vehiculo1_observaciones, residente.vehiculo2_observaciones, residente.vehiculo3_observaciones].filter(obs => obs).join(' | ')
        }));
      });
    }
  }

/**
 * Nombre de la función: `loadResidentes`
 * Autor: Freya López - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función carga la lista de residentes desde la API y actualiza la propiedad `residentes` con los datos obtenidos.
 * Además de los datos básicos del residente, se combinan y formatean los datos de las placas de los vehículos y las observaciones vehiculares.
 * Si ocurre un error al obtener los datos, se muestra un mensaje de error en la consola.
 */

  loadResidentes(): void {
    this.apiService.getResidentes().subscribe(
      (data: any[]) => {
        this.residentes = data.map((residente: any) => ({
          ...residente,
          placas: [residente.vehiculo1_placa, residente.vehiculo2_placa, residente.vehiculo3_placa].filter(placa => placa).join(', '),
          observacionesVehicular: [residente.vehiculo1_observaciones, residente.vehiculo2_observaciones, residente.vehiculo3_observaciones].filter(obs => obs).join(' | ')
        }));
      },
      (error) => {
        console.error("Error al obtener residentes:", error);
      }
    );
  }

logout() {
  this.loggedIn = false;
  localStorage.removeItem('username'); // Limpiar nombre de usuario del localStorage
  localStorage.removeItem('role'); // Limpiar rol del localStorage
  this.router.navigate(['/login']); // Redirige a la página de inicio de sesión
}

exportarExcel(): void {
  console.log("Exportando a Excel...");
  
  // Si no hay residentes, mostramos advertencia y salimos de la función
  if (this.residentes.length === 0) {
    console.warn("No hay datos para exportar");
    return;
  }

  // Filtramos los datos para excluir la columna de Acciones
  const residentesFiltrados = this.residentes.map(residente => {
    return {
      Placas: residente.placas,
      Vehiculo: residente.observacionesVehicular,
      Solar: residente.solar,
      M2: residente.m2,
      Perfil: residente.perfil,
      Nombre: `${residente.usuario.nombre} ${residente.usuario.apellido}`,
      Sexo: residente.sexo,
      Cedula: residente.cedula,
      Celular: residente.celular,
      Direccion: residente.direccion,
      Observaciones: residente.observaciones
    };
  });

  // Crear la hoja de Excel con los datos filtrados
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(residentesFiltrados);

  // Aplicar estilos a las cabeceras
  const cabeceras = [
    'A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'J1', 'K1'
  ];
  // Aplicar ajustes de ancho para columnas
  ws['!cols'] = [
    { wpx: 100 }, // Placas
    { wpx: 100 }, // Vehículo
    { wpx: 80 },  // Solar
    { wpx: 50 },  // M2
    { wpx: 100 }, // Perfil
    { wpx: 150 }, // Nombre
    { wpx: 60 },  // Sexo
    { wpx: 120 }, // Cédula
    { wpx: 120 }, // Celular
    { wpx: 200 }, // Dirección
    { wpx: 200 }  // Observaciones
  ];

  // Crear y exportar el archivo Excel
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Residentes");
  XLSX.writeFile(wb, "Listado_Residentes_Estilos.xlsx");
}


  filtrar() {
    const filtroLower = this.filtro.toLowerCase();
    return this.residentes.filter(
      (row) =>
        (row.usuario.nombre && row.usuario.nombre.toLowerCase().includes(filtroLower)) ||
        (row.usuario.apellido && row.usuario.apellido.toLowerCase().includes(filtroLower)) ||
        (row.sexo && row.sexo.toLowerCase().includes(filtroLower)) ||
        (row.cedula && row.cedula.toLowerCase().includes(filtroLower)) ||
        (row.perfil && row.perfil.toLowerCase().includes(filtroLower)) ||
        (row.observaciones && row.observaciones.toLowerCase().includes(filtroLower))
    );
  }  

/**
 * Nombre de la función: `editResidentes`
 * Autor: Freya López - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función permite editar un residente. Primero, obtiene los datos del residente desde la API utilizando su ID.
 * Luego, abre un modal de edición con los datos del residente. Si el usuario confirma la edición en el modal, se actualiza el residente en la API.
 * Después de actualizar el residente, se recarga la lista de residentes y se forza la detección de cambios para asegurar que la vista se actualice.
 * Si se cierra el modal con rechazo, se registra el motivo en la consola.
 */

  editResidentes(id: number): void {
    // Obtiene los datos del residente a editar
    this.apiService.getResidente(id).subscribe(data => {
      // Abre el modal para editar el residente
      const modalRef = this.modalService.open(EditarResidenteDialogoComponent, {
        size: 'lg',
        backdrop: 'static',
        centered: true
      });
      // Pasa los datos del residente al modal
      modalRef.componentInstance.residente = data;
      // Maneja el resultado del modal
      modalRef.result.then(result => {
        if (result) {
          // Actualiza el residente en la API
          this.apiService.updateResidente(id, result).subscribe(
            response => {
              // Recarga la lista de residentes para reflejar los cambios
              this.loadResidentes();
              // Forza la detección de cambios para asegurar que la vista se actualice
              this.cdr.detectChanges();
            },
            error => {
              console.error('Error al actualizar residente:', error);
            }
          );
        }
      }, (reason) => {
        console.log('Modal cerrado con rechazo:', reason);
      });
    });
  }
  
/**
 * Nombre de la función: `deleteResidentes`
 * Autor: Freya López - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función elimina un residente después de confirmar la acción a través de un cuadro de diálogo de confirmación. 
 * Si el usuario confirma la eliminación, se realiza una solicitud a la API para eliminar el residente con el ID proporcionado.
 * Después de eliminar el residente, se recarga la lista de residentes para reflejar los cambios.
 * Si ocurre un error durante la eliminación, se muestra un mensaje de error en la consola.
 */

  deleteResidentes(id: number): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: "¡Esta acción eliminará el registro de residente de forma permanente!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("Eliminando Residente con ID:", id);
        this.apiService.deleteResidente(id).subscribe(
          () => {
            console.log("Residente eliminado con éxito");
            this.loadResidentes(); // Volver a cargar la lista de residentes después de la eliminación
          },
          (error) => {
            console.error("Error al eliminar Residente:", error);
          }
        );
      } else {
        console.log("Eliminación cancelada");
      }
    });
  }
}
