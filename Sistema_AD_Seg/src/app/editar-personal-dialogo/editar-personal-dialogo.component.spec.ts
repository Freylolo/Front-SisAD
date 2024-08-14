import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPersonalDialogoComponent } from './editar-personal-dialogo.component';

describe('EditarPersonalDialogoComponent', () => {
  let component: EditarPersonalDialogoComponent;
  let fixture: ComponentFixture<EditarPersonalDialogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditarPersonalDialogoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditarPersonalDialogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
