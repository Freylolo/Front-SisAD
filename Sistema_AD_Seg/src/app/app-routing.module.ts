import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
import { authGuard } from './auth.guard';
import { AccessDeniedComponent } from './access-denied/access-denied.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

/**
 * Configuración de rutas para la aplicación.
 * 
 * Las rutas se definen utilizando el módulo `RouterModule` de Angular. Cada ruta especifica un componente que se debe mostrar
 * cuando el usuario navega a una URL específica. Algunas rutas requieren autenticación mediante el `authGuard`.
 */

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' } ,// Redirigir la ruta por defecto 
  { path: "login", component: LoginComponent, pathMatch: "full" },
  { path: 'registro-control', component: RegistroControlComponent, pathMatch: "full" ,canActivate: [authGuard] },
  { path: 'formulario-control', component: FormularioControlComponent, pathMatch: "full",canActivate: [authGuard]  },
  { path: 'registro-personal', component: RegistroPersonalComponent, pathMatch: "full", canActivate: [authGuard]  },
  { path: 'formulario-personal', component: FormularioPersonalComponent, pathMatch: "full",canActivate: [authGuard]  },
  { path: 'registro-residentes', component: RegistroResidentesComponent, pathMatch: "full" ,canActivate: [authGuard] },
  { path: 'formulario-residentes', component: FormularioResidentesComponent, pathMatch: "full",canActivate: [authGuard]  },
  { path: 'eventos', component: EventosComponent, pathMatch: "full" , canActivate: [authGuard] },
  { path: 'registro-evento', component: RegistroEventoComponent, pathMatch: "full", canActivate: [authGuard]  },
  { path: 'registro-visitantes', component: RegistroVisitantesComponent, pathMatch: "full", canActivate: [authGuard]  },
  { path: 'registro-alicuotas', component: RegistroAlicuotasComponent, pathMatch: "full", canActivate: [authGuard]  },
  { path: 'alicuotas', component: AlicuotasComponent, pathMatch: "full", canActivate: [authGuard] },
  { path: 'notificaciones', component: NotificacionesComponent, pathMatch: "full", canActivate: [authGuard] },
  { path: 'loginpassword' , component: LoginpasswordComponent, pathMatch: "full"},
  { path: 'gestionusuario' , component: GestionusuarioComponent, pathMatch: "full", canActivate: [authGuard] },
  { path: 'registro-usuario' , component: RegistroUsuarioComponent, pathMatch: "full", canActivate: [authGuard] },
  { path: 'lector-qr' , component: LectorQrComponent, pathMatch: "full" , canActivate: [authGuard] },
  { path: 'access-denied', component: AccessDeniedComponent },
  { path: 'reset-password', component: ResetPasswordComponent , pathMatch: "full" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
