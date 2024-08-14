import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroControlComponent } from './registro-control.component';

describe('RegistroControlComponent', () => {
  let component: RegistroControlComponent;
  let fixture: ComponentFixture<RegistroControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistroControlComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegistroControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
