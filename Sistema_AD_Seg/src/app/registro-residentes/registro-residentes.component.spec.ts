import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroResidentesComponent } from './registro-residentes.component';

describe('RegistroResidentesComponent', () => {
  let component: RegistroResidentesComponent;
  let fixture: ComponentFixture<RegistroResidentesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistroResidentesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegistroResidentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
