import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroAlicuotasComponent } from './registro-alicuotas.component';

describe('RegistroAlicuotasComponent', () => {
  let component: RegistroAlicuotasComponent;
  let fixture: ComponentFixture<RegistroAlicuotasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistroAlicuotasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegistroAlicuotasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
