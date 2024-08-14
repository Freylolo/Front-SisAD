import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroVisitantesComponent } from './registro-visitantes.component';

describe('RegistroVisitantesComponent', () => {
  let component: RegistroVisitantesComponent;
  let fixture: ComponentFixture<RegistroVisitantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistroVisitantesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegistroVisitantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
