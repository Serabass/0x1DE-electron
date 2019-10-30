import { Component, OnInit } from '@angular/core';
import { CodeModel } from '@ngstack/code-editor';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss']
})
export class DocumentComponent implements OnInit {
  editorOptions = {theme: 'vs-dark', language: 'javascript'};

  theme = 'vs-dark';

  codeModel: CodeModel = {
    language: 'asm',
    uri: 'main.asm',
    value: `
:loop
  ADD A, 0x01
  SET PC, loop
  `
  };

  options = {
    contextmenu: true,
    minimap: {
      enabled: true
    }
  };

  onCodeChanged(value) {
    console.log('CODE', value);
  }
  constructor() { }

  ngOnInit() {
  }

}
