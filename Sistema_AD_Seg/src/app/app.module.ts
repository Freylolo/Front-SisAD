import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { QRCodeModule } from 'angularx-qrcode';
import { NgxScannerQrcodeModule } from 'ngx-scanner-qrcode';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgbModule, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap'; 


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegistroControlComponent } from './registro-control/registro-control.component';
import { FormularioControlComponent } from './formulario-control/formulario-control.component';
import { RegistroPersonalComponent } from './registro-personal/registro-personal.component';
import { FormularioPersonalComponent } from './formulario-personal/formulario-personal.component';
import { RegistroResidentesComponent } from './registro-residentes/registro-residentes.component';
import { FormularioResidentesComponent } from './formulario-residentes/formulario-residentes.component';
import { EventosComponent } from './eventos/eventos.component';
import { RegistroEventoComponent } from './registro-evento/registro-evento.component';
import { RegistroVisitantesComponent } from './registro-visitantes/registro-visitantes.component';
import { RegistroAlicuotasComponent } from './registro-alicuotas/registro-alicuotas.component';
import { AlicuotasComponent } from './alicuotas/alicuotas.component';
import { NotificacionesComponent } from './notificaciones/notificaciones.component';
import { LoginpasswordComponent } from './loginpassword/loginpassword.component';
import { GestionusuarioComponent } from './gestionusuario/gestionusuario.component';
import { RegistroUsuarioComponent } from './registro-usuario/registro-usuario.component';
import { LectorQrComponent } from './lector-qr/lector-qr.component';
import { AccessDeniedComponent } from './access-denied/access-denied.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { RolePipe } from './role.pipe';
import { EditarControlDialogoComponent } from './editar-control-dialogo/editar-control-dialogo.component';
import { EditarUsuariosDialogoComponent } from './editar-usuarios-dialogo/editar-usuarios-dialogo.component';
import { EditarAlicuotasDialogoComponent } from './editar-alicuotas-dialogo/editar-alicuotas-dialogo.component';
import { EditarPersonalDialogoComponent } from './editar-personal-dialogo/editar-personal-dialogo.component';
import { EditarResidenteDialogoComponent } from './editar-residente-dialogo/editar-residente-dialogo.component';
import { InvitadosModalComponent } from './invitados-modal/invitados-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegistroControlComponent,
    FormularioControlComponent,
    RegistroPersonalComponent,
    FormularioPersonalComponent,
    RegistroResidentesComponent,
    FormularioResidentesComponent,
    EventosComponent,
    RegistroEventoComponent,
    RegistroVisitantesComponent,
    RegistroAlicuotasComponent,
    AlicuotasComponent,
    NotificacionesComponent,
    LoginpasswordComponent,
    GestionusuarioComponent,
    RegistroUsuarioComponent,
    LectorQrComponent,
    AccessDeniedComponent,
    RolePipe,
    EditarControlDialogoComponent,
    ResetPasswordComponent,
    EditarUsuariosDialogoComponent,
    EditarAlicuotasDialogoComponent,
    EditarPersonalDialogoComponent,
    EditarResidenteDialogoComponent,
    InvitadosModalComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    QRCodeModule,
    NgxScannerQrcodeModule,
    BrowserAnimationsModule,
    CommonModule,
    HttpClientModule,
    NgxPaginationModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    NgbModule,
    NgbDatepickerModule,
    BsDatepickerModule.forRoot()
  
  ],
  providers: [
    provideClientHydration(),
    provideHttpClient(withFetch()),
  
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
