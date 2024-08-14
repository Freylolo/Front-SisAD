import { Component, OnInit } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Router } from "@angular/router";
import { ApiService } from "../api.service";
import { PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import * as XLSX from "xlsx";
import Swal from 'sweetalert2';
import { RolePipe } from "../role.pipe";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { InvitadosModalComponent } from "../invitados-modal/invitados-modal.component";


@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.component.html',
  styleUrl: './eventos.component.css'
})
export class EventosComponent {

  username: string = ""; // Inicialmente vacío
  p: number = 1; // Página actual de paginacion
  private loggedIn = false;
  filtro: string = "";

 
  eventos: any[] = [];
  residentes: any[] = [];
  usuarios: any[] = [];
  row: any;
  idUsuario: number | null = null;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private modalService: NgbModal,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem("username") || "Invitado";
    }
    this.loadUserId();
  }

  loadUserId(): void {
    this.apiService.getUserIdByUsername(this.username).subscribe(
      (response: any) => {
        this.idUsuario = response.id_usuario;
        console.log("ID Usuario cargado:", this.idUsuario);
  
        // Ahora que tenemos el ID del usuario, cargamos los eventos
        this.loadEventos();
      },
      (error) => {
        console.error("Error al cargar el ID del usuario:", error);
      }
    );
  }
  
/**
 * Nombre de la función: loadEventos
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función carga la lista de eventos desde la API y procesa cada evento para incluir información 
 * adicional sobre el usuario y el residente relacionados. Primero, obtiene la lista de eventos y luego 
 * para cada evento, realiza llamadas adicionales a la API para obtener los datos del usuario y del residente. 
 * Los datos combinados se almacenan en la propiedad `eventos`, que luego se ordena por fecha y hora.
 * 
 * @returns void
 */

loadEventos(): void {
  const userRole = this.isRole('Residente') ? 'Residente' : 'Otro'; 
  this.apiService.getEventos().subscribe(
    (eventos: any[]) => {
      this.eventos = [];
      eventos.forEach((evento) => {
        // Verificar si el evento debe ser mostrado según el rol del usuario
        if (userRole === 'Residente') {
          // Filtrar eventos de tipo 'Hogar' solo si el usuario en sesión es el creador
          if (evento.tipo_evento !== 'Hogar' || (evento.tipo_evento === 'Hogar' && evento.id_usuario === this.idUsuario)) {
            // Obtener usuario relacionado
            this.apiService.getUsuario(evento.id_usuario).subscribe((usuario: any) => {
              // Obtener residente relacionado
              this.apiService.getResidente(evento.id_residente).subscribe((residente: any) => {
                // Combinar datos en el objeto evento
                this.eventos.push({
                  ...evento,
                  usuario: usuario,
                  residente: residente
                });
                // Ordenar los eventos por fecha (opcional)
                this.eventos.sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime());
              }, (error) => {
                console.error("Error al obtener residente:", error);
              });
            }, (error) => {
              console.error("Error al obtener usuario:", error);
            });
          } else {
            console.log("Evento excluido por tipo 'Hogar' y creador no coincide:", evento);
          }
        } else {
          // Para otros roles, no aplicar el filtro y mostrar todos los eventos
          console.log("Evento incluido para rol diferente:", evento);
          // Obtener usuario relacionado
          this.apiService.getUsuario(evento.id_usuario).subscribe((usuario: any) => {
            // Obtener residente relacionado
            this.apiService.getResidente(evento.id_residente).subscribe((residente: any) => {
              // Combinar datos en el objeto evento
              this.eventos.push({
                ...evento,
                usuario: usuario,
                residente: residente
              });
              // Ordenar los eventos por fecha (opcional)
              this.eventos.sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime());
            }, (error) => {
              console.error("Error al obtener residente:", error);
            });
          }, (error) => {
            console.error("Error al obtener usuario:", error);
          });
        }
      });
    },
    (error) => {
      console.error("Error al obtener eventos:", error);
    }
  );
}
  
/**
 * Nombre de la función: logout
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función maneja el proceso de cierre de sesión. Establece la propiedad `loggedIn` a `false`, 
 * elimina el nombre de usuario del `localStorage` y redirige al usuario a la página de inicio de sesión.
 * 
 * @returns void
 */

  logout(): void {
    this.loggedIn = false;
    localStorage.removeItem("username"); 
    this.router.navigate(["/login"]); 
  }

/**
 * Nombre de la función: exportarExcel
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función exporta la lista de eventos a un archivo Excel. Primero, verifica si hay eventos disponibles para exportar. 
 * Luego, convierte la lista de eventos en una hoja de cálculo usando la biblioteca `XLSX`, crea un nuevo libro de trabajo, 
 * y añade la hoja de cálculo al libro. Finalmente, guarda el archivo Excel con el nombre "Listado_Eventos.xlsx".
 * 
 * @returns void
 */

  exportarExcel(): void {
    if (this.eventos.length === 0) {
      return;
    }
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.eventos);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Eventos");
    XLSX.writeFile(wb, "Listado_Eventos.xlsx");
  }

/**
 * Nombre de la función: filtrar
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función filtra la lista de eventos en función del valor de `filtro`. Convierte el filtro a minúsculas y busca 
 * coincidencias en varios campos del objeto `evento`, incluyendo datos del usuario, residente y otros campos adicionales 
 * como `sexo`, `perfil`, y `observaciones`. Devuelve una lista filtrada de eventos que coinciden con el criterio de búsqueda.
 * 
 * @returns any[] - Una lista de eventos que coinciden con el filtro aplicado.
 */

  filtrar(): any[] {
    const filtroLower = this.filtro.toLowerCase();
    return this.eventos.filter(
      (row) =>
        // Filtro basado en datos del objeto 'usuario'
        (row.usuario?.nombre && row.usuario.nombre.toLowerCase().includes(filtroLower)) ||
        (row.usuario?.apellido && row.usuario.apellido.toLowerCase().includes(filtroLower)) ||
        // Filtro basado en datos del objeto 'residente'
        (row.residente?.cedula && row.residente.cedula.toLowerCase().includes(filtroLower)) ||
        (row.residente?.celular && row.residente.celular.toLowerCase().includes(filtroLower)) ||
        (row.sexo && row.sexo.toLowerCase().includes(filtroLower)) ||
        (row.perfil && row.perfil.toLowerCase().includes(filtroLower)) ||
        (row.observaciones && row.observaciones.toLowerCase().includes(filtroLower))
    );
  }

/**
 * Nombre de la función: deleteEventos
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función maneja la eliminación de un evento después de confirmar la acción con el usuario. Muestra una alerta de 
 * confirmación usando SweetAlert, y si el usuario confirma, realiza una solicitud a la API para eliminar el evento 
 * especificado por `id`. Tras la eliminación, vuelve a cargar la lista de eventos. Si la eliminación es cancelada, 
 * 
 * @param id - El identificador del evento que se desea eliminar.
 * @returns void
 */

  deleteEventos(id: number): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: "¡Esta acción eliminará el evento de forma permanente!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteEvento(id).subscribe(
          () => {
            this.loadEventos(); // Volver a cargar la lista de eventos después de la eliminación
          },
          (error) => {
            console.error("Error al eliminar evento:", error);
          }
        );
      } else {
        console.log("Eliminación cancelada");
      }
    });
  }

/**
 * Nombre de la función: getFileUrl
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función devuelve la URL completa para acceder a un archivo específico basado en su nombre. 
 * Utiliza el servicio `apiService` para obtener la URL del archivo. 
 * 
 * @param filename - El nombre del archivo para el cual se desea obtener la URL.
 * @returns string - La URL completa del archivo.
 */

  getFileUrl(filename: string): string {
    return this.apiService.getFileUrl(filename); 
  }

/**
 * Nombre de la función: isRole
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función verifica si el rol del usuario, almacenado en `localStorage`, coincide con el rol especificado. 
 * Devuelve `true` si el rol del usuario coincide con el rol dado y `false` en caso contrario.
 * 
 * @param role - El rol que se desea comprobar.
 * @returns boolean - `true` si el rol del usuario coincide con el rol dado, `false` en caso contrario.
 */

  isRole(role: string): boolean {
    const userRole = localStorage.getItem('role');
    return userRole === role;
  }

/**
 * Nombre de la función: updateEstado
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función actualiza el estado de un evento específico en la base de datos y en el modelo de datos local. 
 * Realiza una solicitud a la API para actualizar el estado del evento con el identificador `id` y el nuevo estado `nuevoEstado`. 
 * Después de recibir la respuesta, actualiza el estado del evento correspondiente en la lista local de eventos. 
 * Si ocurre un error durante el proceso, se registra en la consola.
 * 
 * @param id - El identificador del evento cuyo estado se desea actualizar.
 * @param nuevoEstado - El nuevo estado que se aplicará al evento.
 * @returns void
 */

  updateEstado(id: number, nuevoEstado: string): void {
  this.apiService.updateEventoEstado(id, nuevoEstado).subscribe(
    (evento) => {
      // Actualiza el estado en el modelo de datos
      const index = this.eventos.findIndex(e => e.id_evento === id);
      if (index !== -1) {
        this.eventos[index].estado = nuevoEstado;
      }
    },
    (error) => {
      console.error('Error al actualizar el estado:', error);
    }
  );
  }

  openInvitadosModal(eventoId: number): void {
    console.log('Evento ID antes de llamar a la API:', eventoId); 
    this.apiService.getInvitadosByEvento(eventoId).subscribe(
      (data: any) => {
        const modalRef = this.modalService.open(InvitadosModalComponent, {
          size: 'lg',
          backdrop: 'static',
          centered: true
        });
        modalRef.componentInstance.data = data; 
      },
      (error) => {
        console.error('Error al obtener invitados del evento:', error);
      }
    );
  }
  
  
  
}
