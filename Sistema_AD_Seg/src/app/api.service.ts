import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable, catchError, throwError } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ApiService {

  // URL base de la API
  private apiUrl = "https://sistema-camino-real.vercel.app//api";

  // Opciones por defecto para las peticiones HTTP
  private httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json",
    }),
  };

  constructor(private http: HttpClient) {}

  // Método para iniciar sesión
  login(login: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/login`, { login, contrasena: password })
      .pipe(
        catchError(this.handleError),
        tap((response) => {
          if (response.success && response.username) {
            // Guarda el nombre de usuario y rol en localStorage
            localStorage.setItem("username", response.username);
            localStorage.setItem("role", response.role);
          }
        })
      );
  }
  
  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logout`, {});
  }

  getUserIdByUsername(username: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/usuarios/username/${username}`);
  }

  getAlicuotasByIdResidente(id_residente: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/alicuotas/residente/${id_residente}`
    );
  }

  // Método para obtener todos los usuarios
  getUsuarios(): Observable<any> {
    console.log("Solicitando usuarios a la API...");
    return this.http
      .get<any>(`${this.apiUrl}/usuarios`)
      .pipe(catchError(this.handleError));
  }

  // Método para obtener un usuario específico por ID
  getUsuario(id: number): Observable<any> {
    console.log(`Solicitando usuario con ID ${id} a la API...`);
    return this.http
      .get<any>(`${this.apiUrl}/usuarios/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Método para crear un nuevo usuario
  createUsuario(usuario: any): Observable<any> {
    console.log("Enviando datos para crear usuario:", usuario);
    return this.http
      .post<any>(`${this.apiUrl}/usuarios`, usuario, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  // Método para actualizar un usuario existente
  updateUsuario(id: number, usuario: any): Observable<any> {
    console.log(`Enviando datos para actualizar usuario con ID ${id}:`, usuario);
    return this.http
      .put<any>(`${this.apiUrl}/usuarios/${id}`, usuario, this.httpOptions)
      .pipe(catchError(this.handleError));
  }  

  // Método para eliminar un usuario
  deleteUsuario(id: number): Observable<any> {
    console.log(`Solicitando eliminación del usuario con ID ${id}`);
    return this.http
      .delete<any>(`${this.apiUrl}/usuarios/${id}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  // Método para obtener todos los personales
  getPersonales(): Observable<any> {
    console.log("Solicitando personales a la API...");
    return this.http
      .get<any>(`${this.apiUrl}/personal`)
      .pipe(catchError(this.handleError));
  }

  // Método para obtener un personal específico por ID
  getPersonal(id: number): Observable<any> {
    console.log(`Solicitando personal con ID ${id} a la API...`);
    return this.http
      .get<any>(`${this.apiUrl}/personal/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Método para crear un nuevo personal
  createPersonal(personal: any): Observable<any> {
    console.log("Enviando datos para crear personal:", personal);
    return this.http
      .post<any>(`${this.apiUrl}/personal`, personal, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  // Método para actualizar un personal existente
  updatePersonal(id: number, personal: any): Observable<any> {
    console.log(
      `Enviando datos para actualizar personal con ID ${id}:`,
      personal
    );
    return this.http
      .put<any>(`${this.apiUrl}/personal/${id}`, personal, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  // Método para eliminar un personal
  deletePersonal(id: number): Observable<any> {
    console.log(`Solicitando eliminación del personal con ID ${id}`);
    return this.http
      .delete<any>(`${this.apiUrl}/personal/${id}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  // Método para obtener todas las alícuotas
  getAlicuotas(): Observable<any> {
    console.log("Solicitando alícuotas a la API...");
    return this.http
      .get<any>(`${this.apiUrl}/alicuotas`)
      .pipe(catchError(this.handleError));
  }

  // Método para obtener una alícuota específica por ID
  getAlicuota(id: number): Observable<any> {
    console.log(`Solicitando alícuota con ID ${id} a la API...`);
    return this.http
      .get<any>(`${this.apiUrl}/alicuotas/${id}`)
      .pipe(catchError(this.handleError));
  }

  getAlicuotasByUser(id_usuario: number): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/alicuotas/user/${id_usuario}`)
      .pipe(catchError(this.handleError));
  }

  // Método para crear una nueva alícuota
  createAlicuota(alicuota: any): Observable<any> {
    console.log("Enviando datos para crear alícuota:", alicuota);
    return this.http
      .post<any>(`${this.apiUrl}/alicuotas`, alicuota, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  // Método para actualizar una alícuota existente
  updateAlicuota(id: number, alicuota: any): Observable<any> {
    console.log(
      `Enviando datos para actualizar alícuota con ID ${id}:`,
      alicuota
    );
    return this.http
      .put<any>(`${this.apiUrl}/alicuotas/${id}`, alicuota, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  // Método para eliminar una alícuota
  deleteAlicuota(id: number): Observable<any> {
    console.log(`Solicitando eliminación de alícuota con ID ${id}`);
    return this.http
      .delete<any>(`${this.apiUrl}/alicuotas/${id}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  marcarpagoAlicuitas(id: number): Observable<any> {
    return this.http
      .put<any>(`${this.apiUrl}/alicuotas/${id}/marcar-pago`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  // Método para obtener todos los eventos
  getEventos(): Observable<any> {
    console.log("Solicitando eventos a la API...");
    return this.http
      .get<any>(`${this.apiUrl}/eventos`)
      .pipe(catchError(this.handleError));
  }

  // Método para obtener un evento específico por ID
  getEvento(id: number): Observable<any> {
    console.log(`Solicitando evento con ID ${id} a la API...`);
    return this.http
      .get<any>(`${this.apiUrl}/eventos/${id}`)
      .pipe(catchError(this.handleError));
  }

    // Método para crear un nuevo evento
    createEvento(evento: FormData): Observable<any> {
      console.log("Enviando datos para crear evento:", evento);
      return this.http.post<any>(`${this.apiUrl}/eventos`, evento)
        .pipe(
          tap(response => {
            console.log('Respuesta del servidor al crear evento:', response);
          }),
          catchError(this.handleError)
        );
    }
    
  // Método para actualizar un evento existente
  updateEvento(id: number, evento: any): Observable<any> {
    console.log(`Enviando datos para actualizar evento con ID ${id}:`, evento);
    return this.http
      .put<any>(`${this.apiUrl}/eventos/${id}`, evento, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  // Método para eliminar un evento
  deleteEvento(id: number): Observable<any> {
    console.log(`Solicitando eliminación del evento con ID ${id}`);
    return this.http
      .delete<any>(`${this.apiUrl}/eventos/${id}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  // Método para obtener todos los residentes
  getResidentes(): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/residentes`)
      .pipe(catchError(this.handleError));
  }

  getResidente(id_residente: number): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/residentes/${id_residente}`)
    .pipe(
      tap(response => {
        // Verifica la respuesta
      }),
      catchError(this.handleError)
    );
  }

  getResidentePorPlaca(placa: string) {
    return this.http
    .get<any>(`${this.apiUrl}/residentes/placa/${placa}`);
  }
  
  // Método para guardar (crear o actualizar) un residente
  guardarResidente(residente: any): Observable<any> {
    if (residente.id) {
      return this.http
        .put<any>(`${this.apiUrl}/residentes/${residente.id}`, residente)
        .pipe(catchError(this.handleError));
    } else {
      return this.http
        .post<any>(`${this.apiUrl}/residentes`, residente)
        .pipe(catchError(this.handleError));
    }
  }

  // Método para crear un nuevo residente
  createResidente(residente: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/residentes`, residente, this.httpOptions)
      .pipe(catchError(this.handleError));
  }
  updateResidente(id: number, residente: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/residentes/${id}`, residente, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(catchError(this.handleError));
  }  
  
  // Método para eliminar un residente
  deleteResidente(id: number): Observable<any> {
    return this.http
      .delete<any>(`${this.apiUrl}/residentes/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Método para obtener todos los registros de control de acceso
  getControlAcceso(): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/control-acceso`)
      .pipe(catchError(this.handleError));
  }

  // Método para obtener un registro de control de acceso por ID
  getControlAccesoById(id: number): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/control-acceso/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Método para crear un nuevo registro de control de acceso
  createControlAcceso(controlAcceso: FormData): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/control-acceso`, controlAcceso)
      .pipe(catchError(this.handleError));
  }

  // Método para actualizar un registro de control de acceso existente
  updateControlAcceso(id: number, controlAcceso: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/control-acceso/${id}`, controlAcceso, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(catchError(this.handleError));
  }
  
  // Método para guardar (crear o actualizar) un registro de control de acceso
  guardarControlAcceso(controlAcceso: any): Observable<any> {
    if (controlAcceso.id_acceso) {
      return this.http
        .put<any>(
          `${this.apiUrl}/control-acceso/${controlAcceso.id_acceso}`,
          controlAcceso,
          this.httpOptions
        )
        .pipe(catchError(this.handleError));
    } else {
      return this.http
        .post<any>(
          `${this.apiUrl}/control-acceso`,
          controlAcceso,
          this.httpOptions
        )
        .pipe(catchError(this.handleError));
    }
  }

  // Método para eliminar un registro de control de acceso
  deleteControlAcceso(id: number): Observable<any> {
    console.log(`Eliminando registro de control de acceso con ID ${id}...`);
    return this.http
      .delete<any>(`${this.apiUrl}/control-acceso/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Obtener usuarios con perfil y rol de seguridad
  getUsuariosSeguridad(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/usuarios/seguridad`);
  }

  checkCedula(cedula: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/residentes/check-cedula/${cedula}`)
      .pipe(catchError(this.handleError));
  }

  checkCorreo(correo: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/residentes/check-correo/${correo}`)
      .pipe(catchError(this.handleError));
  }

  checkCedulaPersonal(cedula: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/personal/check-cedula-personal/${cedula}`)
      .pipe(catchError(this.handleError));
  }

  checkCorreoPersonal(correo: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/personal/check-correo-personal/${correo}`)
      .pipe(catchError(this.handleError));
  }
  checkCelularPersonal(celular: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/personal/check-celular/${celular}`)
      .pipe(catchError(this.handleError));
  }

  checkCorreoUsuarios(correo: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/usuarios/check-correo-usuarios/${correo}`)
      .pipe(catchError(this.handleError));
  }

  checkUsernameUsuarios(username: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/usuarios/check-username-usuarios/${username}`)
      .pipe(catchError(this.handleError));
  }

  requestPasswordReset(correo: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/usuarios/solicitar-restablecimiento`, { correo });
  }

  resetPassword(token: string, newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios/restablecer-contrasena`, {
      token: token,
      new_password: newPassword,
      new_password_confirmation: confirmPassword
    });
  }
  
  checkCelularR(celular: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/residentes/check-celularR/${celular}`)
      .pipe(catchError(this.handleError));
  }
  
  // Método para enviar SMS
  sendSms(to: string, message: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/send-sms`, { to, message });
  }

  sendWhatsAppMessage(to: string, message: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/send-whatsapp`, { to, message });
  }  

  // Método para enviar correos
  sendEmail(emailData: any): Observable<any> {
    console.log("Enviando correo con datos:", emailData);
    return this.http
      .post<any>(`${this.apiUrl}/enviar-correo`, emailData, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  // Manejo de errores
  handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = "Ocurrió un error desconocido";
    if (error.error instanceof ErrorEvent) {
      // Errores del cliente o de red
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Errores del backend
      errorMessage = `Código de error: ${error.status}\nMensaje: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }

  updateEventoEstado(id: number, nuevoEstado: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/eventos/${id}/estado`, {
      estado: nuevoEstado,
    });
  }

  getUserIdByEmail(correoElectronico: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/usuarios/getUserIdByEmail`, {
        correo_electronico: correoElectronico,
      })
      .pipe(catchError(this.handleError));
  }

  getFileUrl(filename: string): string {
    return `${this.apiUrl}/uploads/${filename}`;
  }
  
  getInvitadosByEvento(eventoId: number): Observable<any> {
    console.log("Evento ID recibido en getInvitadosByEvento:", eventoId); // Verifica el valor de eventoId
    const url = `${this.apiUrl}/eventos/${encodeURIComponent(eventoId)}/invitados`;
    console.log("URL de solicitud en getInvitadosByEvento:", url); // Verifica la URL
    return this.http.get(url);
  }
  
  guardarInvitados(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/invitados`, data);
  }
}
