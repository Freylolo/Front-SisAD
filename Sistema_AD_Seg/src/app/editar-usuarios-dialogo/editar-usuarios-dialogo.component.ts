import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../api.service'

@Component({
  selector: 'app-editar-usuarios-dialogo',
  templateUrl: './editar-usuarios-dialogo.component.html',
  styleUrl: './editar-usuarios-dialogo.component.css'
})
export class EditarUsuariosDialogoComponent implements OnInit {
  form!: FormGroup;
  data: any;

  constructor(
    public modalRef: NgbActiveModal,
    private fb: FormBuilder,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      id_usuario: [this.data.id_usuario, Validators.required],
      correo_electronico: [this.data.correo_electronico, [Validators.required, Validators.email]],
      contrasena: [this.data.contrasena, Validators.required],
      nombre: [this.data.nombre, Validators.required],
      apellido: [this.data.apellido, Validators.required],
      username: [this.data.username, Validators.required],
      perfil: [this.data.perfil, Validators.required],
    });
  }
  
/**
 * Nombre de la función: save
 * Author: Freya Lopez - Flopezl@ug.edu.ec
 * 
 * Resumen:
 * Esta función guarda los datos del formulario si es válido. Muestra los datos en la consola 
 * y luego cierra el modal con los datos del formulario. 
 * Si el formulario no es válido, no realiza ninguna acción.
 * 
 * @returns void
 */

  save(): void {
    if (this.form.valid) {
      console.log('Datos a enviar:', this.form.value);
      this.modalRef.close(this.form.value);
    }
  }
  
}
