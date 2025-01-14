import { ComponentFixture, TestBed } from '@angular/core/testing'

import { KursStudentComponent } from './kurs-student.component';

describe('KursStudentComponent', () => {
  let component: KursStudentComponent;
  let fixture: ComponentFixture<KursStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KursStudentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KursStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
