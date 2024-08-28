import { Component,OnInit,ViewChildren,QueryList,ElementRef,ChangeDetectorRef} from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "../api.service";
import { PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import * as mammoth from "mammoth";
import { jsPDF } from "jspdf";
import { QRCodeModule } from "angularx-qrcode";
import Swal from 'sweetalert2';
import html2canvas from "html2canvas";

@Component({
  selector: "app-registro-evento",
  templateUrl: "./registro-evento.component.html",
  styleUrl: "./registro-evento.component.css",
})
export class RegistroEventoComponent implements OnInit {
  username: string = ""; // Inicialmente vacío
  private loggedIn = false;
  rol: string | null = null;
  filtro: string = "";
  eventos: any[] = [];
  diasDeshabilitados: Set<string> = new Set();
  horasDisponibles: string[] = [];
  minFecha: string = "";
  maxFecha: string = "";
  fechaSeleccionada: string = "";
  horaSeleccionada: string = "";
  qevento: any = {};
  qrCodes: any[] = [];

  nuevoEvento: any = {
    id_usuario: "",
    id_residente: "",
    nombre: "",
    apellidos: "",
    celular: "",
    cedula: "",
    nombre_evento: "",
    direccion_evento: "",
    cantidad_vehiculos: 0,
    cantidad_personas: 0,
    tipo_evento: "",
    fecha_hora: "",
    duracion_evento: 0,
    listado_evento: null,
    observaciones: "",
    estado: "En proceso de aceptación",
  };

  data: any = {
    nombreEvento: "",
    nombreEncargado: "",
    fechaEvento: "",
    horaEvento: "",
    direccionEvento: "",
    invitados: [],
  };

  validationErrors: any = {};
  private flatpickrInstance: any = null;
  public tienePagosPendientes: boolean = false;

  @ViewChildren("qrContainer") qrContainers!: QueryList<ElementRef>;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit(): void {
    this.initializeFlatpickr();
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem("username") || "Invitado";
      this.rol = localStorage.getItem("role");
      if (this.rol === "Residente") {
        this.cargarDatosResidente();
      }
    }
  }

/**
 * Nombre de la función: `cargarDatosResidente`
 * Autor: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función carga los datos del residente y el estado de los pagos del residente en función del nombre de usuario.
 * Realiza una serie de pasos encadenados para obtener el id_usuario, luego el id_residente y los detalles asociados,
 * y finalmente verifica el estado de los pagos del residente.
 */

  cargarDatosResidente() {
    // Paso 1: Obtener id_usuario usando el username
    this.apiService.getUserIdByUsername(this.username).subscribe(
      (user) => {
        const idUsuario = user.id_usuario;  
        // Paso 2: Obtener todos los residentes
        this.apiService.getResidentes().subscribe(
          (residentes) => {
            // Paso 3: Encontrar el residente con el id_usuario
            const residente = residentes.find((r: any) => r.id_usuario === idUsuario);
            if (residente) {
              const idResidente = residente.id_residente;  
              // Paso 4: Obtener detalles del residente usando id_residente
              this.apiService.getResidente(idResidente).subscribe(
                (residenteData) => {                  
                  // Obtener los datos del usuario
                  this.apiService.getUsuario(idUsuario).subscribe(
                    (usuarioData) => {  
                      // Actualizar los datos del evento
                      this.nuevoEvento = { 
                        ...this.nuevoEvento,
                        id_usuario: idUsuario,
                        id_residente: idResidente,
                        nombre: usuarioData.nombre,
                        apellidos: usuarioData.apellido,
                        celular: residenteData.celular,
                        cedula: residenteData.cedula,
                      };
                      // Paso 5: Obtener el estado de pago del residente desde la tabla alicuotas
                      this.apiService.getAlicuotasByIdResidente(idResidente).subscribe(
                        (alicuotas) => {                          
                          // Verificar si hay alícuotas pendientes
                          this.tienePagosPendientes = alicuotas.some((alicuota: any) => {
                            return !alicuota.pagado;
                          });
                            this.cargarEventos();
                        },
                        (error) => console.error('Error al obtener alícuotas:', error)
                      );
                    },
                    (error) => console.error('Error al obtener datos del usuario:', error)
                  );
                },
                (error) => console.error('Error al obtener datos del residente:', error)
              );
            } else {
              console.error('No se encontró el residente para el id_usuario proporcionado.');
            }
          },
          (error) => console.error('Error al obtener residentes:', error)
        );
      },
      (error) => console.error('Error al obtener id_usuario:', error)
    );
  }

/**
 * Nombre de la función: `validarAccesoEstancias`
 * Autor: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función valida el acceso a estancias de la urbanización en función del estado de pago del residente.
 * Muestra un mensaje de advertencia y deshabilita opciones específicas en un elemento `select` si el residente no
 * tiene pagos al día.
 */

  validarAccesoEstancias() {
    // Mensaje de advertencia
    alert(
      "Lo sentimos, por falta de pagos, no puede ocupar estancias de la urbanización."
    );
    // Deshabilitar opciones específicas en el select
    const selectElement = document.getElementById(
      "tipoEvento"
    ) as HTMLSelectElement;
    if (selectElement) {
      const opciones = selectElement.options;
      for (let i = 0; i < opciones.length; i++) {
        const option = opciones[i];
        if (
          [
            "Evento social",
            "Cancha de futbol",
            "Parque comunitario",
            "Club Acuatico",
            "Club Residencial",
          ].includes(option.value)
        ) {
          option.disabled = true;
        }
      }
    }
  }

/**
 * Nombre de la función: `cargarEventos`
 * Autor: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función carga los eventos desde el servicio API y almacena los datos en la propiedad `eventos`.
 * Después de cargar los eventos, inicializa el calendario `flatpickr`.
 */

  cargarEventos() {
    this.apiService.getEventos().subscribe((eventos) => {
      this.eventos = eventos;
      // Inicializa flatpickr aquí pero no configura días deshabilitados todavía
      this.initializeFlatpickr();
    });
  }


/**
 * Nombre de la función: `bloquearHoras`
 * Autor: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función actualiza la lista de horas disponibles en base a la fecha seleccionada y los eventos ocupados.
 * - Si no se ha seleccionado una fecha, vacía la lista de horas disponibles.
 * - Filtra los eventos para el día seleccionado que no sean de tipo "Hogar".
 * - Genera un array de horas ocupadas y actualiza la lista de horas disponibles utilizando esos datos.
 */
bloquearHoras() {
  if (!this.fechaSeleccionada) {
    this.horasDisponibles = [];
    return;
  }
  
  const fechaSeleccionada = new Date(this.fechaSeleccionada + "T00:00:00");
  fechaSeleccionada.setHours(0, 0, 0, 0);

  console.log("Tipo de evento:", this.nuevoEvento.tipo_evento); // Depuración

  if (this.nuevoEvento.tipo_evento === "Hogar") {
    // Para eventos de tipo 'Hogar', mostrar horas entre 07:00 y 22:00 con intervalos de 10 minutos.
    this.horasDisponibles = this.generarHorasDisponiblesHogar(fechaSeleccionada);
  } else {
    // Para otros tipos de eventos, bloquear horas ocupadas en días con más de 2 eventos.
    const diasOcupados = this.eventos
      .filter(evento => {
        const eventoFecha = new Date(evento.fecha_hora);
        eventoFecha.setHours(0, 0, 0, 0);
        return eventoFecha.getTime() === fechaSeleccionada.getTime();
      })
      .reduce((acc, evento) => {
        const fechaEvento = new Date(evento.fecha_hora);
        const finEvento = new Date(fechaEvento.getTime() + evento.duracion_evento * 60 * 60 * 1000);
        acc.push({ start: fechaEvento, end: finEvento });
        return acc;
      }, []);

    this.horasDisponibles = this.generarHorasDisponibles(fechaSeleccionada, diasOcupados);
  }
}


generarHorasDisponibles(
  fechaSeleccionada: Date,
  ocupados: { start: Date; end: Date }[]
): string[] {
  const horasDisponibles: string[] = [];
  if (!(fechaSeleccionada instanceof Date)) {
    console.error("La fecha seleccionada no es una instancia de Date:", fechaSeleccionada);
    return horasDisponibles;
  }
  const fecha = new Date(fechaSeleccionada);
  fecha.setHours(7, 0, 0, 0); // Empezar desde las 07:00 del día seleccionado
  const finDia = new Date(fechaSeleccionada);
  finDia.setHours(22, 0, 0, 0); // Fin del día seleccionado a las 22:00

  while (fecha <= finDia) {
    const esOcupado = ocupados.some(
      ocupado => fecha >= ocupado.start && fecha < ocupado.end
    );
    if (!esOcupado) {
      const horaFormateada = fecha.toTimeString().slice(0, 5);
      horasDisponibles.push(horaFormateada);
    }
    fecha.setMinutes(fecha.getMinutes() + 30); // Incrementar por 30 minutos
  }
  return horasDisponibles;
}

generarHorasDisponiblesHogar(fechaSeleccionada: Date): string[] {
  const horasDisponibles: string[] = [];
  const fecha = new Date(fechaSeleccionada);
  fecha.setHours(7, 0, 0, 0); // Empezar desde las 07:00 del día seleccionado
  const finDia = new Date(fechaSeleccionada);
  finDia.setHours(22, 0, 0, 0); // Fin del día seleccionado a las 22:00

  while (fecha <= finDia) {
    const horaFormateada = fecha.toTimeString().slice(0, 5);
    horasDisponibles.push(horaFormateada);
    fecha.setMinutes(fecha.getMinutes() + 10); // Incrementar por 15 minutos
  }

  return horasDisponibles;
} 

/**
 * Nombre de la función: `verificarHorasDisponibles`
 * Autor: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función verifica si el nuevo evento seleccionado se superpone con eventos existentes en el sistema.
 * - No realiza ninguna verificación si el tipo de evento es "Hogar" o si no se ha seleccionado una fecha y hora.
 * - Calcula la hora de inicio y fin del evento seleccionado.
 * - Compara estas horas con los eventos existentes para verificar si hay superposiciones.
 * - Si hay conflictos, muestra una alerta indicando que la hora seleccionada se superpone con otro evento.
 */

  verificarHorasDisponibles(ocupados?: { start: Date; end: Date }[]) {
    const tipoEvento = this.nuevoEvento.tipo_evento;
    if (tipoEvento !== "Hogar") {
      return;
    }
    if (!this.nuevoEvento.fecha_hora) {
      return;
    }
    const fechaHoraSeleccionada = new Date(this.nuevoEvento.fecha_hora);
    const finEventoSeleccionado = new Date(
      fechaHoraSeleccionada.getTime() +
        this.nuevoEvento.duracion_evento * 60 * 60 * 1000
    );
    const conflicto = this.eventos.some((evento) => {
      const start = new Date(evento.fecha_hora);
      const end = new Date(
        start.getTime() + evento.duracion_evento * 60 * 60 * 1000
      );
      return fechaHoraSeleccionada < end && finEventoSeleccionado > start;
    });
    if (conflicto) {
      alert("La hora seleccionada se superpone con otro evento existente.");
    }
  }

/**
 * Nombre de la función: `onTipoEventoChange`
 * Autor: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función maneja los cambios en la selección del tipo de evento y realiza las siguientes acciones:
 * - Verifica si el residente tiene pagos pendientes.
 *   - Si es así y el tipo de evento seleccionado está restringido, muestra una alerta informando que el acceso está restringido.
 *   - Deshabilita las opciones de eventos no permitidos en el `select` de tipo de evento y limpia la selección actual.
 * - Si no hay pagos pendientes, habilita todas las opciones del `select` de tipo de evento.
 * - Actualiza los días deshabilitados basados en el nuevo tipo de evento seleccionado, a menos que el tipo sea 'Hogar', en cuyo caso limpia los días deshabilitados.
 * - Inicializa o actualiza la configuración de `flatpickr`.
 */

  onTipoEventoChange() {
    // Verifica el estado de pago del residente
    if (this.tienePagosPendientes) {
        // Si el residente no ha pagado, restringe las opciones de eventos
        if (
            [
                "Evento social",
                "Cancha de futbol",
                "Parque comunitario",
                "Club Acuatico",
                "Club Residencial",
            ].includes(this.nuevoEvento.tipo_evento)
        ) {
            Swal.fire({
                title: 'Acceso Restringido',
                text: 'Lo sentimos, por falta de pagos, no puede ocupar estancias de la urbanización.',
                icon: 'warning',
                confirmButtonText: 'Aceptar'
            }).then(() => {
                this.nuevoEvento.tipo_evento = ""; // Limpiar selección si no es válida
                // Deshabilitar opciones específicas en el select
                const selectElement = document.getElementById("tipoEvento") as HTMLSelectElement;
                if (selectElement) {
                    const opciones = selectElement.options;
                    for (let i = 0; i < opciones.length; i++) {
                        const option = opciones[i];
                        if (
                            [
                                "Evento social",
                                "Cancha de futbol",
                                "Parque comunitario",
                                "Club Acuatico",
                                "Club Residencial",
                            ].includes(option.value)
                        ) {
                            option.disabled = true;
                        }
                    }
                }
            });
            return; // Salir de la función
        }
    }
    // Si no hay pagos pendientes, asegurarse de que todas las opciones estén habilitadas
    const selectElement = document.getElementById("tipoEvento") as HTMLSelectElement;
    if (selectElement) {
        const opciones = selectElement.options;
        for (let i = 0; i < opciones.length; i++) {
            opciones[i].disabled = false; // Habilitar todas las opciones
        }
    }
    // Actualizar días deshabilitados solo si el tipo de evento no es 'Hogar'
    if (this.nuevoEvento.tipo_evento !== "Hogar") {
        this.deshabilitarDias(); // Recalcular días deshabilitados basado en el nuevo tipo de evento
    } else {
        // Si es 'Hogar', asegurarse de que no haya días deshabilitados
        this.diasDeshabilitados.clear();
    }
    // Inicializar flatpickr o actualizar la configuración si ya está inicializado
    this.initializeFlatpickr(); // Asegúrate de inicializar o actualizar flatpickr
}

/**
 * Nombre de la función: `deshabilitarDias`
 * Autor: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función actualiza la lista de días deshabilitados en función de la fecha actual y los eventos:
 * - Inicializa un conjunto `diasDeshabilitados` para almacenar los días que deben ser deshabilitados en el calendario.
 * - Agrega la fecha actual al conjunto de días deshabilitados.
 * - Itera sobre los eventos para deshabilitar los días anteriores a la fecha actual, siempre que el tipo de evento no sea "Hogar".
 * - Actualiza el calendario `flatpickr` para reflejar los días deshabilitados recién calculados.
 */

  deshabilitarDias() {
  const ahora = new Date();
  const ahoraKey = `${ahora.getFullYear()}-${(ahora.getMonth() + 1).toString().padStart(2, "0")}-${ahora.getDate().toString().padStart(2, "0")}`;

  // Reiniciar días deshabilitados
  this.diasDeshabilitados = new Set<string>();

  if (this.nuevoEvento.tipo_evento === 'Hogar') {
    // Bloquear días y meses anteriores a hoy para eventos de tipo "Hogar"
    this.diasDeshabilitados.add(ahoraKey);
    this.eventos.forEach((evento) => {
      if (evento.tipo_evento === 'Hogar') {
        const fecha = new Date(evento.fecha_hora);
        const fechaKey = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, "0")}-${fecha.getDate().toString().padStart(2, "0")}`;
        if (fechaKey < ahoraKey) {
          this.diasDeshabilitados.add(fechaKey);
        }
      }
    });
  } else {
    // Para otros tipos de eventos, bloquear días con al menos dos eventos creados
    const eventosPorDia = new Map<string, number>();
    this.eventos.forEach((evento) => {
      if (evento.tipo_evento !== 'Hogar') {
        const fecha = new Date(evento.fecha_hora);
        const fechaKey = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, "0")}-${fecha.getDate().toString().padStart(2, "0")}`;
        eventosPorDia.set(fechaKey, (eventosPorDia.get(fechaKey) || 0) + 1);
      }
    });

    eventosPorDia.forEach((count, fechaKey) => {
      if (count >= 2) {
        this.diasDeshabilitados.add(fechaKey);
      }
    });
  }

  this.actualizarFlatpickrConDiasDeshabilitados();
 }



/**
 * Nombre de la función: `actualizarFlatpickrConDiasDeshabilitados`
 * Autor: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función actualiza la instancia de `flatpickr` para deshabilitar los días especificados en el conjunto `diasDeshabilitados`:
 * - Verifica si la instancia de `flatpickr` existe.
 * - Si existe, actualiza la configuración de `flatpickr` para deshabilitar los días especificados en el conjunto.
 */

  actualizarFlatpickrConDiasDeshabilitados(): void {
  if (this.flatpickrInstance) {
    this.flatpickrInstance.set('disable', Array.from(this.diasDeshabilitados));
    this.flatpickrInstance.redraw(); // Redibuja el calendario para reflejar los cambios
  }
}


/**
 * Nombre de la función: `initializeFlatpickr`
 * Autor: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función inicializa la instancia de `flatpickr` para el elemento con el ID `#fecha`. 
 * Si la instancia ya está inicializada, actualiza los días deshabilitados.
 * 
 */

initializeFlatpickr(): void {
  if (!this.flatpickrInstance) {
    // Solo inicializar si no está ya inicializado
    this.flatpickrInstance = flatpickr("#fecha", {
      minDate: "today",
      maxDate: this.maxFecha,
      disable: Array.from(this.diasDeshabilitados), // Esto se actualizará después
      onChange: (selectedDates) => {
        this.fechaSeleccionada = selectedDates[0]
          ? selectedDates[0].toISOString().slice(0, 10)
          : "";
        console.log("Fecha seleccionada en flatpickr:", this.fechaSeleccionada);
        this.onFechaChange();
      },
    });
  } else {
    // Actualizar los días deshabilitados si la instancia ya está inicializada
    this.actualizarFlatpickrConDiasDeshabilitados();
  }
}

/**
 * Nombre de la función: `onTipoEventoSelect`
 * Autor: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función se llama cuando el usuario selecciona un tipo de evento de un menú desplegable. 
 * Actualiza el campo `tipo_evento` en el objeto `nuevoEvento` y llama a `onTipoEventoChange` para manejar cualquier lógica adicional relacionada con el tipo de evento seleccionado.
 * 
 */

  onTipoEventoSelect(event: any) {
    this.nuevoEvento.tipo_evento = event.target.value;
    this.onTipoEventoChange();
  }

/**
 * Nombre de la función: `isHoraDeshabilitada`
 * Autor: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Verifica si una hora específica está deshabilitada basándose en los eventos existentes. 
 * Una hora se considera deshabilitada si se superpone con la duración de algún evento en la lista de eventos.
 */

  isHoraDeshabilitada(fechaHora: string): boolean {
    if (!fechaHora) return false;
    const fechaHoraSeleccionada = new Date(fechaHora);
    const finEventoSeleccionado = new Date(
      fechaHoraSeleccionada.getTime() +
        this.nuevoEvento.duracion_evento * 60 * 60 * 1000
    );
    return this.eventos.some((evento) => {
      const start = new Date(evento.fecha_hora);
      const end = new Date(
        start.getTime() + evento.duracion_evento * 60 * 60 * 1000
      );
      return fechaHoraSeleccionada < end && finEventoSeleccionado > start;
    });
  }

/**
 * Nombre de la función: `isFechaDeshabilitada`
 * Autor: Freya López - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Verifica si una fecha específica está deshabilitada basándose en la lista de días deshabilitados.
 * Una fecha se considera deshabilitada si está incluida en el conjunto de días deshabilitados (`this.diasDeshabilitados`).
 */
  isFechaDeshabilitada(fecha: string): boolean {
  const fechaKey = `${fecha.split("-").join("-")}`;
  return this.diasDeshabilitados.has(fechaKey);
  }


/**
 * Nombre de la función: `calcularMinMaxFecha`
 * Autor: Freya López - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Calcula la fecha mínima y máxima permitidas para la selección en el calendario, basándose en la fecha actual.
 * La fecha mínima es el día de hoy y la fecha máxima es un año en el futuro.
 * 
 */  
  calcularMinMaxFecha() {
    const ahora = new Date();
    this.minFecha = ahora.toISOString().slice(0, 10); // Solo la parte de la fecha
    const unAnoEnElFuturo = new Date(ahora);
    unAnoEnElFuturo.setFullYear(ahora.getFullYear() + 1);
    this.maxFecha = unAnoEnElFuturo.toISOString().slice(0, 10); // Solo la parte de la fecha
    console.log("Min Fecha:", this.minFecha);
    console.log("Max Fecha:", this.maxFecha);
    console.log("Nuevo Evento:", this.nuevoEvento);
  }

/**
 * Nombre de la función: `onFechaChange`
 * Autor: Freya López - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función se ejecuta cuando se selecciona una nueva fecha en el calendario. 
 * Dependiendo del tipo de evento seleccionado (`tipo_evento`), recalcula las horas disponibles o limpia las horas disponibles.
 * Además, actualiza la fecha y hora del evento en curso.
 * 
 * Acción:
 * - Si el tipo de evento no es "Hogar", llama a `bloquearHoras` para recalcular las horas disponibles basadas en la fecha seleccionada.
 * - Si el tipo de evento es "Hogar", limpia las horas disponibles estableciendo `horasDisponibles` como un arreglo vacío.
 * - Llama a `actualizarFechaHora` para actualizar la información de fecha y hora del evento.
 */ 

onFechaChange() {
  const fechaSeleccionada = new Date(this.fechaSeleccionada);

  if (this.nuevoEvento.tipo_evento === "Hogar") {
    this.bloquearHoras(); // Recalcular horas disponibles para eventos tipo 'Hogar'
  } else {
    // Para otros tipos de eventos, calcular horas disponibles bloqueadas
    const diasOcupados = this.eventos
      .filter(evento => {
        const eventoFecha = new Date(evento.fecha_hora);
        eventoFecha.setHours(0, 0, 0, 0);
        return eventoFecha.getTime() === fechaSeleccionada.getTime();
      })
      .reduce((acc, evento) => {
        const fechaEvento = new Date(evento.fecha_hora);
        const finEvento = new Date(fechaEvento.getTime() + evento.duracion_evento * 60 * 60 * 1000);
        acc.push({ start: fechaEvento, end: finEvento });
        return acc;
      }, []);

    this.horasDisponibles = this.generarHorasDisponibles(fechaSeleccionada, diasOcupados);
  }

  this.actualizarFechaHora();
}

  onHoraChange() {
    this.actualizarFechaHora();
  }

/**
 * Nombre de la función: `actualizarFechaHora`
 * Autor: Freya López - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función actualiza la propiedad `fecha_hora` del objeto `nuevoEvento` combinando la fecha y hora seleccionadas.
 * La fecha y hora se formatean en el formato `YYYY-MM-DD HH:MM:SS` antes de asignarse a `nuevoEvento.fecha_hora`.
 */

  actualizarFechaHora() {
    if (this.fechaSeleccionada && this.horaSeleccionada) {
      const horaFormateada = this.horaSeleccionada.padStart(5, "0");
      // Combina fecha y hora en el formato YYYY-MM-DD HH:MM:SS
      const fechaHoraLocal = `${this.fechaSeleccionada} ${horaFormateada}:00`;
      // Asigna el formato local al evento
      this.nuevoEvento.fecha_hora = fechaHoraLocal;
      console.log(
        "Fecha y hora actualizada para el backend:",
        this.nuevoEvento.fecha_hora
      );
    }
  }

/**
 * Nombre de la función: `subirdoc`
 * Autor: Freya López - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función maneja la carga de un archivo DOCX desde un evento de selección de archivo. 
 * Si se selecciona un archivo, se asigna al objeto `nuevoEvento` y se llama a `parseDocument` para procesar el archivo.
 */

  subirdoc(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.nuevoEvento.listado_evento = file;
      console.log("Archivo DOCX cargado:", file.name); // Log para el archivo cargado
      this.parseDocument(file);
    } else {
      console.error("No se seleccionó ningún archivo.");
    }
  }

/**
 * Nombre de la función: `parseDocument`
 * Autor: Freya López - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función procesa un archivo DOCX cargado, convirtiéndolo a HTML usando la biblioteca `mammoth`. 
 * Luego, extrae datos del HTML convertido y genera códigos QR a partir de los datos extraídos.
 */

  parseDocument(file: File) {
    const reader = new FileReader();
    reader.onload = async (event: any) => {
      const arrayBuffer = event.target.result;
      try {
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const html = result.value;
        // Extraer datos del HTML convertido
        const variables = this.extractDataFromHtml(html);
        this.generateQRCodes(variables);
      } catch (error) {
        console.error("Error al procesar el documento:", error);
      }
    };
    reader.readAsArrayBuffer(file);
  }

/**
 * Nombre de la función: `extractDataFromHtml`
 * Autor: Freya López - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función extrae datos específicos de un documento HTML convertido a partir de un archivo DOCX. 
 * Utiliza el DOMParser para analizar el HTML y extraer información sobre el evento, el encargado, 
 * y los invitados. Los datos extraídos incluyen nombre del evento, nombre del encargado, 
 * celular, fecha y hora del evento, dirección del evento, y una lista de invitados con detalles 
 * como nombres, apellidos, cédula, placa y observaciones.
 */

extractDataFromHtml(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  
  // Extraer datos del HTML
  const nombreEvento =
    doc.querySelector("table tr:nth-child(2) td:nth-child(2)")?.textContent?.trim() || "";
  const nombreEncargado =
    doc.querySelector("table tr:nth-child(3) td:nth-child(2)")?.textContent?.trim() || "";
  const celular =
    doc.querySelector("table tr:nth-child(3) td:nth-child(4)")?.textContent?.trim() || "";
  const fechaEvento =
    doc.querySelector("table tr:nth-child(4) td:nth-child(2)")?.textContent?.trim() || "";
  const horaEvento =
    doc.querySelector("table tr:nth-child(4) td:nth-child(4)")?.textContent?.trim() || "";
  const direccionEvento =
    doc.querySelector("table tr:nth-child(5) td:nth-child(2)")?.textContent?.trim() || "";

  // Extraer los datos de los invitados
  const invitados: any[] = [];
  const rows = doc.querySelectorAll("table tr");
  let isReadingInvitados = false;

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");

    if (cells.length === 5 && cells[0]?.textContent?.trim() === "Nombres") {
      isReadingInvitados = true; // Comienza a leer los datos de los invitados
      return; // Salta la fila de encabezado
    }

    if (isReadingInvitados && cells.length === 5) {
      // Solo agrega filas si tienen contenido en las celdas esperadas
      if (cells[0]?.textContent?.trim() && cells[1]?.textContent?.trim()) {
        invitados.push({
          nombres: cells[0]?.textContent?.trim() || "",
          apellidos: cells[1]?.textContent?.trim() || "",
          cedula: cells[2]?.textContent?.trim() || "",
          placa: cells[3]?.textContent?.trim() || "",
          observaciones: cells[4]?.textContent?.trim() || "",
        });
      }
    }
  });

  // Console log para verificar los datos extraídos
  console.log({
    nombreEvento,
    nombreEncargado,
    celular,
    fechaEvento,
    horaEvento,
    direccionEvento,
    invitados,
  });   
   // Guardar los datos extraídos temporalmente
   this.data = {
    nombreEvento,
    nombreEncargado,
    celular,
    fechaEvento,
    horaEvento,
    direccionEvento,
    invitados,
  };

  // No llamar a guardarInvitados aquí, solo extraer los datos
  return this.data;
}


/**
 * Nombre de la función: `generateQRCodes`
 * Autor: Freya López - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función genera códigos QR para cada invitado utilizando la información extraída del documento HTML. 
 * Los datos incluidos en cada código QR abarcan nombres, apellidos, cédula, dirección, fecha y hora del evento, 
 * placa del invitado y nombre del evento. La función también actualiza el cambio de detección de cambios 
 * en el componente y llama a la función `generatePDFs` para la generación de PDFs con los códigos QR.
 */

  generateQRCodes(data: any) {
    const {
      nombreEvento,
      nombreEncargado,
      fechaEvento,
      horaEvento,
      direccionEvento,
      invitados,
    } = data;
    this.qrCodes = invitados.map((invitado: any) => ({
      qrData: `${invitado.nombres}\n${invitado.apellidos}\n${invitado.cedula}\n${direccionEvento}\n${fechaEvento}\n${horaEvento}\n${invitado.placa}\n${nombreEvento}`,
      nombre: invitado.nombres,
      apellido: invitado.apellidos,
    }));
    this.cdr.detectChanges();
    this.generatePDFs();
  }

/**
 * Nombre de la función: `generatePDFs`
 * Autor: Freya López - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función genera archivos PDF para cada contenedor de código QR. Primero, verifica que haya contenedores QR disponibles. 
 * Luego, itera sobre cada contenedor, haciéndolo visible temporalmente para capturarlo como una imagen con `html2canvas`. 
 * Cada imagen se inserta en un nuevo archivo PDF, centrada y acompañada del nombre y apellido del invitado. 
 * La función maneja la posibilidad de que la imagen sea más alta que una página de PDF, agregando nuevas páginas si es necesario. 
 * Finalmente, crea un nombre de archivo para cada PDF y resuelve la promesa con una lista de PDFs generados.
 */

  generatePDFs(): Promise<{ pdf: jsPDF; nombreArchivo: string }[]> {
    return new Promise((resolve, reject) => {
      if (this.qrContainers.length === 0) {
        reject("Contenedores QR no encontrados");
        return;
      }
      const pdfs: { pdf: jsPDF; nombreArchivo: string }[] = []; // Declarar tipo explícito
      let completed = 0;
      const total = this.qrContainers.length;
      this.qrContainers.forEach((container, index) => {
        setTimeout(() => {
          // Hacer visible el contenedor temporalmente
          container.nativeElement.style.opacity = "1";
          container.nativeElement.style.pointerEvents = "auto";
          console.log(`Contenedor ${index} hecho visible`);

          html2canvas(container.nativeElement)
            .then((canvas) => {
              // Volver a ocultar el contenedor
              container.nativeElement.style.opacity = "0";
              container.nativeElement.style.pointerEvents = "none";
              console.log(`Contenedor ${index} oculto de nuevo`);

              const imgData = canvas.toDataURL("image/png");
              const pdf = new jsPDF("p", "mm", "a4");
              const pdfWidth = pdf.internal.pageSize.getWidth();
              const pdfHeight = pdf.internal.pageSize.getHeight();

              const imgWidth = 190; // Ancho fijo en mm
              const imgHeight = (canvas.height * imgWidth) / canvas.width;

              // Calcular la posición para centrar la imagen horizontalmente
              const xOffset = (pdfWidth - imgWidth) / 2; // Centrar horizontalmente
              let position = 20; // Espacio para el texto y márgenes

              // Agregar texto con el nombre y apellido del invitado
              const invitado = this.qrCodes[index];
              const nombreApellido = `Nombre: ${invitado.nombre}\nApellidos: ${invitado.apellido}`;
              pdf.setFontSize(12);
              pdf.text(nombreApellido, 10, position); // Posición del texto en la página
              position += 20; // Ajustar la posición del texto para que no se sobreponga con la imagen

              // Agregar la imagen al PDF
              pdf.addImage(
                imgData,
                "PNG",
                xOffset,
                position,
                imgWidth,
                imgHeight
              );

              // Verificar si es necesario agregar más páginas
              const heightLeft = imgHeight - (pdfHeight - position - 20);
              if (heightLeft > 0) {
                // Agregar más páginas si es necesario
                pdf.addPage();
                pdf.text(nombreApellido, 10, 10); // Agregar texto en nuevas páginas
                pdf.addImage(imgData, "PNG", xOffset, 20, imgWidth, imgHeight); // Ajustar posición para el QR en nuevas páginas
              }

              // Crear el nombre del archivo PDF usando nombre y apellido del invitado
              const nombreArchivo =
                `qr_${invitado.nombre}_${invitado.apellido}.pdf`.replace(
                  /\s+/g,
                  "_"
                );
              pdfs.push({ pdf, nombreArchivo }); // Agregar al array de PDFs

              // Incrementar el contador de PDFs completados
              completed++;
              if (completed === total) {
                // Resolver la promesa con los PDFs generados
                resolve(pdfs);
              }
            })
            .catch((error) => {
              console.error("Error al generar el PDF:", error);
              reject(error);
            });
        }, 500); 
      });
    });
  }

/**
 * Nombre de la función: `guardar`
 * Autor: Freya López - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función guarda un nuevo evento enviando los datos del formulario a través de `FormData` a la API. 
 * Después de crear el evento, genera archivos PDF para cada código QR asociado utilizando la función `generatePDFs`. 
 * Los PDFs generados se descargan automáticamente. 
 * Finalmente, muestra una alerta de éxito y redirige a la vista de eventos. En caso de error, muestra una alerta correspondiente y maneja errores de validación o errores generales.
 */

guardar(): void {
  const formData = new FormData();

  Object.keys(this.nuevoEvento).forEach((key) => {
    if (this.nuevoEvento[key] !== null) {
      formData.append(key, this.nuevoEvento[key]);
    }
  });
  
  this.apiService.createEvento(formData).subscribe(
    (response) => {
      // Accede al ID del evento en la propiedad correcta
      const eventoId = response.id_evento;

      // Verifica que el ID del evento se haya obtenido correctamente
      console.log('ID del evento recibido:', eventoId);
  
      // Almacenar los datos de los invitados temporalmente
      this.guardarInvitados(eventoId, this.data.invitados);

      // Generar los códigos QR después de guardar el evento
      this.generatePDFs()
        .then((pdfs) => {
          // Descargar los PDFs después de generarlos
          pdfs.forEach(({ pdf, nombreArchivo }) => {
            pdf.save(nombreArchivo);
            console.log(`PDF guardado como ${nombreArchivo}`);
          });

          // Mostrar alerta de éxito y redirigir a /eventos después de generar y descargar los PDFs
          Swal.fire({
            title: 'Evento Creado',
            text: 'El evento ha sido creado exitosamente y los PDFs se han guardado.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          }).then(() => {
            this.router.navigate(['/eventos']);
          });
        })
        .catch((error) => {
          console.error("Error al generar los PDFs:", error);
          Swal.fire({
            title: 'Error',
            text: 'Se produjo un error al generar los PDFs. Por favor, inténtelo de nuevo más tarde.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        });
    },
    (error) => {
      console.error("Error al crear evento:", error);
      if (error.status === 422) {
        this.validationErrors = error.error.errors;
        Swal.fire({
          title: 'Error de Validación',
          text: 'Por favor, revise los errores en el formulario.',
          icon: 'warning',
          confirmButtonText: 'Aceptar'
        });
      } else {
        this.validationErrors = {
          general:
            "Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde.",
        };
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

guardarInvitados(eventoId: number, invitados: any[]): void {
  console.log('ID del evento recibido en guardarInvitados:', eventoId);

  // Usar datos de fecha y hora desde this.data
  const data = {
    evento_id: eventoId,
    fecha_evento: this.data.fechaEvento,
    hora_evento: this.data.horaEvento,
    invitados: invitados
  };

  console.log('Datos a enviar:', data);

  this.apiService.guardarInvitados(data).subscribe(
    (response) => {
      console.log('Datos guardados exitosamente');
      Swal.fire({
        title: 'Datos Guardados',
        text: 'Los datos se han guardado exitosamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
    },
    (error) => {
      console.error('Error al guardar los datos:', error);
      Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error al guardar los datos. Por favor, inténtelo de nuevo más tarde.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  );
}



  logout() {
    this.loggedIn = false;
    localStorage.removeItem("username"); 
    localStorage.removeItem("role");
    this.router.navigate(["/login"]); 
  }
}
