import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ToolbarComponent } from "./toolbar.component";
import { NgZorroAntdModule } from "ng-zorro-antd";

describe("ToolbarComponent", () => {
  let component: ToolbarComponent;
  let fixture: ComponentFixture<ToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgZorroAntdModule],
      declarations: [ToolbarComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
