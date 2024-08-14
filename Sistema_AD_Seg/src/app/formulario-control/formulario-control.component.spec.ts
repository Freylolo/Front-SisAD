import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioControlComponent } from './formulario-control.component';

describe('FormularioControlComponent', () => {
  let component: FormularioControlComponent;
  let fixture: ComponentFixture<FormularioControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormularioControlComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormularioControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
