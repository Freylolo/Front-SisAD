import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitadosModalComponent } from './invitados-modal.component';

describe('InvitadosModalComponent', () => {
  let component: InvitadosModalComponent;
  let fixture: ComponentFixture<InvitadosModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InvitadosModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InvitadosModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
