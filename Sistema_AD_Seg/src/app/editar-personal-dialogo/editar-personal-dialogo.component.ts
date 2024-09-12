import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-editar-personal-dialogo',
  templateUrl: './editar-personal-dialogo.component.html',
  styleUrl: './editar-personal-dialogo.component.css'
})
export class EditarPersonalDialogoComponent implements OnInit {
  @Input() personal!: any; // Recibido del componente que abre el modal
  form!: FormGroup;
  validationErrors: any = {};

  constructor(
    public modalRef: NgbActiveModal,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
        nombre: [this.personal.usuario.nombre, Validators.required],
        apellido: [this.personal.usuario.apellido, Validators.required],
        id_personal: [this.personal.id_personal],  // No editable
        sexo: [this.personal.sexo, Validators.required],
        perfil: [this.personal.perfil, Validators.required],
        celular: [this.personal.celular, Validators.required],
        cedula: [this.personal.celular, Validators.required],
        correo_electronico: [this.personal.usuario.correo_electronico, [Validators.email]],
        observaciones: [this.personal.observaciones]
    });
} 

/**
 * Nombre de la función: guardar
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función guarda los datos del formulario si es válido. Agrega datos adicionales (ID de usuario e ID de personal) 
 * al objeto del formulario antes de mostrar un mensaje de éxito usando SweetAlert. 
 * Una vez que el mensaje de éxito es mostrado y confirmado por el usuario, el modal se cierra con los datos guardados.
 * 
 * @returns void
 */

guardar(): void {
  if (this.form.invalid) {
    console.error('El formulario es inválido.');
    return;
  }
  const personalData = 
  { ...this.form.value, 
    id_usuario: this.personal.id_usuario,  id_personal: this.personal.id_personal };  
  // Muestra un mensaje de éxito
  Swal.fire({
    title: 'Guardado con éxito',
    text: 'Los datos se han guardado correctamente.',
    icon: 'success',
    confirmButtonText: 'Aceptar'
  }).then(() => {
    // Cierra el modal después de mostrar el mensaje de éxito
    this.modalRef.close(personalData);
  });
}  
}