import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioResidentesComponent } from './formulario-residentes.component';

describe('FormularioResidentesComponent', () => {
  let component: FormularioResidentesComponent;
  let fixture: ComponentFixture<FormularioResidentesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormularioResidentesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormularioResidentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
