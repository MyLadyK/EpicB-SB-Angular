import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterManagementComponent } from './character-management.component';

describe('CharacterManagementComponent', () => {
  let component: CharacterManagementComponent;
  let fixture: ComponentFixture<CharacterManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CharacterManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
