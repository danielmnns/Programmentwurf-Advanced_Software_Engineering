import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KursComponent } from './user-kurs.component';

describe('UserKursComponent', () => {
  let component: KursComponent;
  let fixture: ComponentFixture<KursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KursComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
