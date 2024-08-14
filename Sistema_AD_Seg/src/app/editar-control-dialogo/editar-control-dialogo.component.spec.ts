import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarControlDialogoComponent } from './editar-control-dialogo.component';

describe('EditarControlDialogoComponent', () => {
  let component: EditarControlDialogoComponent;
  let fixture: ComponentFixture<EditarControlDialogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditarControlDialogoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditarControlDialogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
