import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemoryDumpComponent } from './memory-dump.component';

describe('MemoryDumpComponent', () => {
  let component: MemoryDumpComponent;
  let fixture: ComponentFixture<MemoryDumpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemoryDumpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemoryDumpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
