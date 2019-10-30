import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-memory-dump',
  templateUrl: './memory-dump.component.html',
  styleUrls: ['./memory-dump.component.scss']
})
export class MemoryDumpComponent implements OnInit {

  public offset = 0;

  public rows = [];

  constructor() { }

  ngOnInit() {
    for (let i = 0; i < 21; i++) {
      this.rows.push([
        '0000',
        '0000',
        '0000',
        '0000',
        '0000',
        '0000',
        '0000',
        '0000',
      ]);
    }
  }
}
