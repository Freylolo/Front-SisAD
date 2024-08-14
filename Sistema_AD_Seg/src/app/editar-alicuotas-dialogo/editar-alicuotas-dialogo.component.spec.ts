import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarAlicuotasDialogoComponent } from './editar-alicuotas-dialogo.component';

describe('EditarAlicuotasDialogoComponent', () => {
  let component: EditarAlicuotasDialogoComponent;
  let fixture: ComponentFixture<EditarAlicuotasDialogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditarAlicuotasDialogoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditarAlicuotasDialogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
