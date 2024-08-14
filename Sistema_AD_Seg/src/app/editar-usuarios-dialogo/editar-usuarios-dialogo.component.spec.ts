import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarUsuariosDialogoComponent } from './editar-usuarios-dialogo.component';

describe('EditarUsuariosDialogoComponent', () => {
  let component: EditarUsuariosDialogoComponent;
  let fixture: ComponentFixture<EditarUsuariosDialogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditarUsuariosDialogoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditarUsuariosDialogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
