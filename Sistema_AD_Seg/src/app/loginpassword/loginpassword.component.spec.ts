import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginpasswordComponent } from './loginpassword.component';

describe('LoginpasswordComponent', () => {
  let component: LoginpasswordComponent;
  let fixture: ComponentFixture<LoginpasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginpasswordComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoginpasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
