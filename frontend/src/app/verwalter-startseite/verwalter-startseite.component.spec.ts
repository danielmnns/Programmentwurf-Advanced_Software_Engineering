import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerwalterStartseiteComponent } from './verwalter-startseite.component';

describe('VerwalterStartseiteComponent', () => {
  let component: VerwalterStartseiteComponent;
  let fixture: ComponentFixture<VerwalterStartseiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerwalterStartseiteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerwalterStartseiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
