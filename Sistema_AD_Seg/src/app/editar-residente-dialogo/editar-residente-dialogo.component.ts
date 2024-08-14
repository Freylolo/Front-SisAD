import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { ApiService } from "../api.service";


@Component({
  selector: 'app-editar-residente-dialogo',
  templateUrl: './editar-residente-dialogo.component.html',
  styleUrl: './editar-residente-dialogo.component.css'
})
export class EditarResidenteDialogoComponent implements OnInit {
  @Input() residente!: any; // Recibido del componente que abre el modal
  form!: FormGroup;
  validationErrors: any = {};

  constructor(
    public modalRef: NgbActiveModal,
    private fb: FormBuilder,
    private apiService: ApiService,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre: [this.residente.usuario.nombre, Validators.required],
      apellido: [this.residente.usuario.apellido, Validators.required],
      cedula: [this.residente.cedula, Validators.required],
      perfil: [this.residente.perfil, Validators.required],
      sexo: [this.residente.sexo, Validators.required],
      direccion: [this.residente.direccion],
      celular: [this.residente.celular, Validators.required],
      correo_electronico: [this.residente.usuario.correo_electronico, [Validators.email]],
      cantidad_vehiculos: [this.residente.cantidad_vehiculos],
      vehiculo1_placa: [this.residente.vehiculo1_placa],
      vehiculo2_placa: [this.residente.vehiculo2_placa],
      vehiculo3_placa: [this.residente.vehiculo3_placa],
      vehiculo1_observaciones: [this.residente.vehiculo1_observaciones],
      vehiculo2_observaciones: [this.residente.vehiculo2_observaciones],
      vehiculo3_observaciones: [this.residente.vehiculo3_observaciones],
      solar: [this.residente.solar, Validators.required],
      m2: [this.residente.m2, Validators.required],
      observaciones: [this.residente.observaciones]
    });
  }  
  
/**
 * Nombre de la función: guardar
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función guarda los datos del formulario si es válido. Prepara los datos del residente, incluyendo el ID de usuario 
 * y el ID de residente, y luego muestra un mensaje de éxito usando SweetAlert. Después de que el usuario confirma el 
 * mensaje de éxito, el modal se cierra con los datos del residente guardados.
 * 
 * @returns void
 */
  
  guardar(): void {
    if (this.form.invalid) {
      return;
    }
    // Prepara los datos del residente
    const residenteData = { 
      ...this.form.value, 
      id_usuario: this.residente.id_usuario, 
      id_residente: this.residente.id_residente 
    };    
    // Muestra un mensaje de éxito
    Swal.fire({
      title: 'Guardado con éxito',
      text: 'Los datos del residente se han guardado correctamente.',
      icon: 'success',
      confirmButtonText: 'Aceptar'
    }).then(() => {
      // Cierra el modal después de mostrar el mensaje de éxito
      this.modalRef.close(residenteData);
    });
  }
}