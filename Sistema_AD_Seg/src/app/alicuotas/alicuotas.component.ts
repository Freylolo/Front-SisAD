import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "../api.service";
import { PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import * as XLSX from "xlsx";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { switchMap, map } from "rxjs/operators";
import Swal from "sweetalert2";
import { EditarAlicuotasDialogoComponent } from "../editar-alicuotas-dialogo/editar-alicuotas-dialogo.component";

@Component({
  selector: "app-alicuotas",
  templateUrl: "./alicuotas.component.html",
  styleUrl: "./alicuotas.component.css",
})
export class AlicuotasComponent {
  username: string = ""; // Inicialmente vacío
  p: number = 1; // Página actual de paginacion
  private loggedIn = false;
  filtro: string = "";

  alicuota: any[] = [];
  residentes: any[] = [];
  usuarios: any[] = [];

  totalAdeudadoGeneral: number = 0; // Total adeudado
  idUsuario: number | null = null;
  role: string | null = null;

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem("username") || "Invitado";
      this.role = localStorage.getItem("role"); // Obtener el rol del localStorage
      if (this.role === "Residente") {
        this.loadUserId(); // Solo cargar el ID si el rol es "Residente"
      } else {
        // Manejo para cuando el rol no es "Residente"
        this.idUsuario = null;
        this.loadAlicuota();
      }
    }
  }

 /**
 * Nombre de la función: loadUserId
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función carga el ID del usuario basado en el nombre de usuario.
 * Si el nombre de usuario no es "Invitado", hace una llamada a la API para 
 * obtener el ID del usuario y luego carga las alícuotas. 
 * Si el usuario es "Invitado", no se cargan alícuotas específicas.
 * 
 */

  loadUserId(): void {
    if (this.username !== "Invitado") {
      this.apiService.getUserIdByUsername(this.username).subscribe(
        (data: any) => {
          this.idUsuario = data.id_usuario;
          this.loadAlicuota(); // Cargar alícuotas después de obtener el ID
        },
        (error) => {
          console.error("Error al obtener ID de Usuario:", error);
        }
      );
    } else {
      // Si el usuario es "Invitado", no cargar alícuotas específicas
      this.idUsuario = null;
      this.loadAlicuota();
    }
  }
 /**
 * Nombre de la función: loadAlicuota
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función obtiene las alícuotas de la API y las procesa. 
 * Para cada alícuota, se obtienen los datos relacionados del usuario y residente.
 * Las alícuotas se filtran por usuario si el rol es "Residente" y se ordenan por fecha.
 * Finalmente, se recalcula el total adeudado general.
 */

  loadAlicuota(): void {
    this.apiService.getAlicuotas().subscribe(
      (alicuotas: any[]) => {
        this.alicuota = [];
        // Crear un array de promesas para obtener los datos relacionados
        const promesas = alicuotas.map((alicuota) => {
          return this.apiService
            .getUsuario(alicuota.residente.id_usuario)
            .pipe(
              switchMap((usuario: any) =>
                this.apiService
                  .getResidente(alicuota.residente.id_residente)
                  .pipe(
                    map((residente: any) => ({
                      ...alicuota,
                      usuario: usuario,
                      residente: residente,
                    }))
                  )
              )
            )
            .toPromise();
        });
        // Esperar a que todas las promesas se resuelvan
        Promise.all(promesas)
          .then((resultados) => {
            this.alicuota = resultados;
            // Filtrar las alícuotas si el rol es "Residente"
            if (this.idUsuario !== null && this.role === "Residente") {
              this.alicuota = this.alicuota.filter(
                (alicuota) => alicuota.residente.id_usuario === this.idUsuario
              );
            }
            // Ordenar las alícuotas por fecha (opcional)
            this.alicuota.sort(
              (a, b) =>
                new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
            );
            // Recalcular total adeudado
            this.calcularTotalAdeudadoGeneral();
          })
          .catch((error) => {
            console.error("Error al obtener datos relacionados:", error);
          });
      },
      (error) => {
        console.error("Error al obtener alícuotas:", error);
      }
    );
  }

 /**
 * Nombre de la función: logout
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función cierra la sesión del usuario. 
 * Establece el estado de loggedIn a falso, elimina el nombre de usuario y el rol del localStorage,
 * y redirige al usuario a la página de inicio de sesión.
 */

  logout() {
    this.loggedIn = false;
    localStorage.removeItem("username"); 
    localStorage.removeItem("role"); 
    this.router.navigate(["/login"]);
  }

 /**
 * Nombre de la función: exportarExcel
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función exporta los datos de las alícuotas a un archivo Excel. 
 * Si no hay datos para exportar, se emite una advertencia. 
 * Los datos de las alícuotas y los residentes se combinan y se convierten en un archivo Excel que se descarga.
 */

  exportarExcel(): void {
    if (this.alicuota.length === 0) {
      console.warn("No hay datos para exportar");
      return;
    }
    // Combina datos de alícuotas y residentes en un nuevo array
    const exportData = this.alicuota.map((row) => ({
      Solar: row.residente.solar,
      M2: row.residente.m2,
      Nombre:  row.usuario?.nombre,
      Apellido: row.usuario?.apellido,
      Cedula: row.residente.cedula,
      Direccion: row.residente.direccion,
      Fecha: row.fecha,
      Mes: row.mes,
      MontoPorCobrar: row.monto_por_cobrar,
      Estado: row.pagado ? "Pagado" : "No Pagado",
      Total: this.getTotalAdeudado(row.residente.id_residente),
    }));
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Alicuotas");
    XLSX.writeFile(wb, "Listado_Alicuotas.xlsx");
  }

 /**
 * Nombre de la función: filtrar
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función filtra las alícuotas basándose en el valor del filtro. 
 * Se busca el término del filtro en los campos de usuario, residente y otros datos de la alícuota.
 */

  filtrar(): any[] {
    const filtroLower = this.filtro.toLowerCase();
    return this.alicuota.filter(
      (row) =>
        // Filtro basado en datos del objeto 'usuario'
        (row.usuario?.nombre &&
          row.usuario.nombre.toLowerCase().includes(filtroLower)) ||
        (row.usuario?.apellido &&
          row.usuario.apellido.toLowerCase().includes(filtroLower)) ||
        // Filtro basado en datos del objeto 'residente'
        (row.residente?.cedula &&
          row.residente.cedula.toLowerCase().includes(filtroLower)) ||
        (row.residente?.celular &&
          row.residente.celular.toLowerCase().includes(filtroLower)) ||
        (row.residente?.solar &&
          row.residente.solar.toLowerCase().includes(filtroLower)) ||
        (row.residente?.direccion &&
          row.residente.direccion.toLowerCase().includes(filtroLower)) ||
        // Filtro basado en datos adicionales de la alícuota
        (row.fecha && row.fecha.toLowerCase().includes(filtroLower)) ||
        (row.mes && row.mes.toLowerCase().includes(filtroLower)) ||
        (row.monto_por_cobrar &&
          row.monto_por_cobrar.toString().toLowerCase().includes(filtroLower))
    );
  }

/**
 * Nombre de la función: calcularTotalAdeudadoGeneral
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función calcula el total adeudado general sumando los montos por cobrar de las alícuotas no pagadas.
 * El resultado se almacena en la propiedad `totalAdeudadoGeneral`.
 */

  calcularTotalAdeudadoGeneral(): void {
    this.totalAdeudadoGeneral = this.alicuota
      .filter((row) => !row.pagado)
      .reduce((sum, row) => sum + row.monto_por_cobrar, 0);
  }

/**
 * Nombre de la función: getTotalAdeudado
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función calcula el total adeudado por un residente específico sumando los montos por cobrar de las alícuotas no pagadas.
 * Si el ID del residente es nulo, retorna 0.
 * 
 * @param id_residente - El ID del residente para el cual se calculará el total adeudado.
 * @returns number - El total adeudado por el residente.
 */

  getTotalAdeudado(id_residente: number | null): number {
    if (id_residente === null) {
      return 0;
    }
    return this.alicuota
      .filter(
        (row) => row.residente?.id_residente === id_residente && !row.pagado
      )
      .reduce((sum, row) => sum + row.monto_por_cobrar, 0);
  }

/**
 * Nombre de la función: marcarpago
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función marca una alícuota como pagada mediante una llamada a la API.
 * Luego de marcar el pago, recarga la lista de alícuotas y recalcula el total adeudado.
 * 
 * @param id - El ID de la alícuota que se marcará como pagada.
 */

  marcarpago(id: number): void {
    this.apiService.marcarpagoAlicuitas(id).subscribe(
      () => {
        // Volver a cargar la lista de alícuotas y recalcular el total adeudado
        this.loadAlicuota();
      },
      (error) => {
        console.error("Error al marcar el pago:", error);
      }
    );
  }

/**
 * Nombre de la función: editAlicuota
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función abre un diálogo para editar una alícuota específica. 
 * Se obtiene la alícuota por ID, se pasa al diálogo para edición, y si se realizan cambios,
 * se actualiza la alícuota en la API y se recarga la lista de alícuotas.
 * 
 * @param id - El ID de la alícuota que se desea editar.
 */

  editAlicuota(id: number): void {
    this.apiService.getAlicuota(id).subscribe((data) => {
      const modalRef = this.modalService.open(EditarAlicuotasDialogoComponent, {
        size: "md",
        backdrop: "static",
        centered: true,
      });
      modalRef.componentInstance.data = data;
      modalRef.result.then(
        (result) => {
          if (result) {
            this.apiService.updateAlicuota(id, result).subscribe(
              (response) => {
                this.loadAlicuota(); // Recargar la lista de alícuotas
              },
              (error) => {
                console.error("Error al actualizar alícuota:", error);
              }
            );
          }
        },
        (reason) => {
        }
      );
    });
  }

/**
 * Nombre de la función: formatDate
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función formatea una fecha en un formato de cadena "YYYY-MM-DD". 
 * Convierte el valor de entrada a un objeto `Date` y luego construye una cadena 
 * con el año, mes y día en el formato especificado.
 * 
 * @param date - La fecha a formatear, puede ser una cadena, número o un objeto `Date`.
 * @returns string - La fecha formateada en el formato "YYYY-MM-DD".
 */

  private formatDate(date: any): string {
    const d = new Date(date);
    return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${(
      "0" + d.getDate()
    ).slice(-2)}`;
  }

/**
 * Nombre de la función: deleteAlicuota
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función solicita una confirmación al usuario antes de eliminar una alícuota específica.
 * Si el usuario confirma la eliminación, se realiza una llamada a la API para eliminar la alícuota.
 * Luego, se recarga la lista de alícuotas. Si se cancela, se emite un mensaje en la consola.
 * 
 * @param id - El ID de la alícuota que se desea eliminar.
 */

  deleteAlicuota(id: number): void {
    Swal.fire({
      title: "¿Está seguro de eliminar esta alicuota?",
      text: "¿Está seguro de eliminar esta alicuota?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteAlicuota(id).subscribe(
          () => {
            this.loadAlicuota(); // Volver a cargar la lista de alícuotas después de la eliminación
          },
          (error) => {
            console.error("Error al eliminar alícuota:", error);
          }
        );
      } else {
        console.log("Eliminación cancelada");
      }
    });
  }
}
