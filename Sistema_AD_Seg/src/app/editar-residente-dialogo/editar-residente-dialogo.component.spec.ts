import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarResidenteDialogoComponent } from './editar-residente-dialogo.component';

describe('EditarResidenteDialogoComponent', () => {
  let component: EditarResidenteDialogoComponent;
  let fixture: ComponentFixture<EditarResidenteDialogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditarResidenteDialogoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditarResidenteDialogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
