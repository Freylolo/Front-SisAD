import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlicuotasComponent } from './alicuotas.component';

describe('AlicuotasComponent', () => {
  let component: AlicuotasComponent;
  let fixture: ComponentFixture<AlicuotasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AlicuotasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AlicuotasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
