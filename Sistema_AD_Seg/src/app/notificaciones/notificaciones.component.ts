import { AfterViewInit, Component, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from "../api.service";
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.component.html',
  styleUrl: './notificaciones.component.css'
})
export class NotificacionesComponent {

  username: string = ''; // Inicialmente vacío
  private loggedIn = false;
  residentes: any[] = [];
  residenteseleccionado: any = null;
  seleccionarmotivo: string = '';
  residendenumero: string = '';
  messageText: string = '';
  

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private router: Router, private apiService: ApiService, private http: HttpClient) {}
    
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem('username') || 'Invitado';
      this.loadResidentes();
    }
  }

/**
 * Nombre de la función: 'loadResidentes'
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Carga la lista de residentes desde la API y, para cada residente, obtiene la información del usuario asociado.
 * Utiliza `switchMap` para manejar la secuencia de operaciones asíncronas y `Promise.all` para esperar a que todas las promesas se resuelvan.
 * Los datos de cada residente se combinan con la información del usuario correspondiente y se almacenan en la variable `residentes`.
 * 
 * @returns void
 */

  loadResidentes(): void {
    this.apiService.getResidentes().pipe(
      switchMap((residentes: any[]) => {
        // Crear un array de promesas para obtener los usuarios relacionados
        const promesas = residentes.map(residente => 
          this.apiService.getUsuario(residente.id_usuario).pipe(
            map(usuario => ({
              ...residente,
              usuario: usuario // Combinar datos de residente y usuario
            }))
          ).toPromise()
        );
        // Esperar a que todas las promesas se resuelvan
        return Promise.all(promesas);
      })
    ).subscribe(
      (data) => {
        this.residentes = data;
      },
      (error) => console.error('Error al cargar residentes', error)
    );
  }

  motivos: Record<string, string> = {
    'Recordatorio': 'Este es un recordatorio importante.\nMensaje enviado por el Sistema de Administracion Camino Real',
    'Alerta': 'Este es un mensaje de alerta. Actúe con precaución.\nMensaje enviado por el Sistema de Administracion Camino Real',
    'Información': 'Esta es una información general sobre nuestras políticas.\nMensaje enviado por el Sistema de Administracion Camino Real',
    'Acceso Permitido': 'Su acceso ha sido permitido. Puede ingresar a las instalaciones. \nMensaje enviado por el Sistema de Administracion Camino Real',
    'Acceso Denegado': 'Su acceso ha sido denegado. Contacte con el personal de seguridad.\nMensaje enviado por el Sistema de Administracion Camino Real',
    'Emergencia': 'Este es un mensaje de emergencia. Por favor, siga las instrucciones.\nMensaje enviado por el Sistema de Administracion Camino Real',
    'Mantenimiento Programado': 'Se llevará a cabo un mantenimiento programado el [fecha]. \nMensaje enviado por el Sistema de Administracion Camino Real',
    'Actualización de Seguridad': 'Se ha actualizado la política de seguridad. Revise los cambios. \nMensaje enviado por el Sistema de Administracion Camino Real',
    'Recordatorio de Visita': 'Este es un recordatorio sobre su visita programada.\nMensaje enviado por el Sistema de Administracion Camino Real',
    'Aviso de Pérdida': 'Se ha encontrado un objeto. Por favor, pase por la oficina de seguridad.\nMensaje enviado por el Sistema de Administracion Camino Real',
    'Cambio de Horario': 'Ha habido un cambio en los horarios. Verifique los nuevos horarios.\nMensaje enviado por el Sistema de Administracion Camino Real',
    'Reglas y Normas': 'Este es un recordatorio sobre las reglas y normas de la comunidad.\nMensaje enviado por el Sistema de Administracion Camino Real',
    'Pago de Alicuotas': 'Este es un recordatorio de que el pago de alícuotas debe realizarse durante los primeros 10 días del mes. Por favor, asegúrese de realizar su pago a tiempo para evitar recargos.\nMensaje enviado por el Sistema de Administracion Camino Real',
    'Delivery en Garita': 'Su delivery ha llegado a la garita de seguridad. Puede pasar a recogerlo en cualquier momento. Gracias por su atención.\nMensaje enviado por el Sistema de Administracion Camino Real',
    'Evento': 'Este es un recordatorio de que sus invitados han llegado al evento. Por favor, diríjalos a la entrada correspondiente. ¡Gracias!. \nMensaje enviado por el Sistema de Administracion Camino Real',
    'Falta de Pago': 'Estimado residente,\n\nLe informamos que, debido a la falta de pago de las alícuotas correspondientes, no podrá hacer uso de las instalaciones de la urbanización ni del servicio de puerta de garita. Es importante que regularice su situación a la mayor brevedad posible para evitar inconvenientes adicionales.\n\nPara cualquier consulta o para efectuar el pago, por favor, comuníquese con la administración.\n\nMensaje enviado por el Sistema de Administracion Camino Real'
  };

/**
 * Nombre de la función: 'onMotivoChange'
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Maneja el evento de cambio en un elemento `<select>`, obteniendo el valor seleccionado y asignando el mensaje correspondiente
 * al campo de texto `messageText`. El mensaje se basa en un objeto `motivos` que asocia valores seleccionados con mensajes predeterminados.
 * 
 * @param event - Evento de cambio que contiene el valor seleccionado del elemento `<select>`.
 * @returns void
 */

  onMotivoChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const motivo = target.value;
    // Asigna el mensaje predeterminado al campo de texto
    this.messageText = this.motivos[motivo] || '';
  }

/**
 * Nombre de la función: 'enviarWhatsApp'
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Verifica si se ha seleccionado un residente y si se ha ingresado un mensaje. Si ambos requisitos están cumplidos, prepara los datos
 * necesarios y realiza una llamada al servicio API para enviar un mensaje de WhatsApp. Muestra alertas al usuario dependiendo del resultado
 * de la operación (éxito o error).
 * 
 * @returns void
 */

  enviarWhatsApp() {
    // Verificar si se ha seleccionado un residente y se ha ingresado un mensaje
    if (!this.residenteseleccionado || !this.messageText) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor, seleccione un residente y un mensaje.',
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
    // Datos a enviar
    const whatsappData = {
      to: this.residenteseleccionado.celular, 
      message: this.messageText
    };
    // Llamada al servicio API para enviar el mensaje de WhatsApp
    this.apiService.sendWhatsAppMessage(whatsappData.to, whatsappData.message).subscribe(
      response => {
        console.log('Respuesta de la API:', response); // Log de la respuesta de la API
        console.log('Mensaje de WhatsApp enviado. SID del mensaje:', response.sid);
        Swal.fire({
          title: 'Éxito',
          text: 'Mensaje de WhatsApp enviado correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
      },
      error => {
        console.error('Error al enviar el mensaje de WhatsApp', error); // Log del error
        Swal.fire({
          title: 'Error',
          text: 'Error al enviar el mensaje de WhatsApp. Por favor, intente de nuevo.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    );
  }

/**
 * Nombre de la función: `enviarSMS`
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función se encarga de enviar un mensaje SMS al número de celular del residente seleccionado. 
 * Primero, valida que se haya seleccionado un residente y que se haya ingresado un mensaje. Si alguno de 
 * estos datos está ausente, muestra una alerta de advertencia. Si los datos están presentes, envía el mensaje 
 * a través de la API correspondiente y muestra una alerta de éxito en caso de éxito, o una alerta de error 
 * en caso de falla. 
 * 
 * Detalles:
 * - Verifica la selección del residente y la presencia del mensaje.
 * - Llama al servicio `sendSms` de la API para enviar el mensaje.
 * - Muestra alertas utilizando SweetAlert para notificar al usuario sobre el estado del envío del mensaje.
 */  

  enviarSMS() {
    if (!this.residenteseleccionado || !this.messageText) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor, seleccione un residente y un mensaje.',
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
    const smsData = {
      to: this.residenteseleccionado.celular, // Accede al número de celular del residente seleccionado
      message: this.messageText
    };
    this.apiService.sendSms(smsData.to, smsData.message)
      .subscribe(
        response => {
          console.log('Mensaje enviado', response);
          Swal.fire({
            title: 'Éxito',
            text: 'Mensaje enviado correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
        },
        error => {
          console.error('Error al enviar el mensaje', error);
          Swal.fire({
            title: 'Error',
            text: 'Error al enviar el mensaje.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      );
  }

  logout() {
    this.loggedIn = false;
    localStorage.removeItem('username'); 
    localStorage.removeItem('role'); 
    this.router.navigate(['/login']); 
  }
  
}
