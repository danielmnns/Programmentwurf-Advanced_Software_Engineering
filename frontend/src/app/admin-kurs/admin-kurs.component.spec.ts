import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminKursComponent } from './admin-kurs.component';

describe('AdminKursComponent', () => {
  let component: AdminKursComponent;
  let fixture: ComponentFixture<AdminKursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminKursComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminKursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
