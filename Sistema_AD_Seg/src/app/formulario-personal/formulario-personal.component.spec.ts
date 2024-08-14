import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioPersonalComponent } from './formulario-personal.component';

describe('FormularioPersonalComponent', () => {
  let component: FormularioPersonalComponent;
  let fixture: ComponentFixture<FormularioPersonalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormularioPersonalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormularioPersonalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
