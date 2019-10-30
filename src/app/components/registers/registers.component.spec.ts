import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistersComponent } from './registers.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';

describe('RegistersComponent', () => {
  let component: RegistersComponent;
  let fixture: ComponentFixture<RegistersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgZorroAntdModule],
      declarations: [ RegistersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
