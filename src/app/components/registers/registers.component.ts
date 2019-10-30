import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-registers',
  templateUrl: './registers.component.html',
  styleUrls: ['./registers.component.scss']
})
export class RegistersComponent implements OnInit {
  public PC = 0x0000;
  public SP = 0x0000;
  public IA = 0x0000;
  public EX = 0x0000;

  public A = 0x0000;
  public B = 0x0000;
  public C = 0x0000;

  public X = 0x0000;
  public Y = 0x0000;
  public Z = 0x0000;

  public I = 0x0000;
  public J = 0x0000;

  constructor() { }

  public groups = [
    ['PC', 'SP', 'IA', 'EX'],
    ['A', 'B', 'C'],
    ['X', 'Y', 'Z'],
    ['I', 'J']
  ];

  ngOnInit() {
  }

}
