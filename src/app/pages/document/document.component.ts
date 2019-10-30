import { Component, OnInit } from '@angular/core';
import { CodeModel } from '@ngstack/code-editor';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss']
})
export class DocumentComponent implements OnInit {
  editorOptions = {theme: 'vs-dark', language: 'asm'};

  theme = 'vs-dark';

  codeModel: CodeModel = {
    language: 'asm',
    uri: 'main.asm',
    value: `
    ; Try some basic stuff
                  SET A, 0x30
                  SET [0x1000], 0x20
                  SUB A, [0x1000]
                  IFN A, 0x10
                     SET PC, crash

    ; Do a loopy thing
                  SET I, 10
                  SET A, 0x2000
    :loop         SET [0x2000+I], [A
                  SUB I, 1
                  IFN I, 0
                     SET PC, loop

    ; Call a subroutine
                  SET X, 0x4
                  JSR testsub
                  SET PC, crash

    :testsub      SHL X, 4
                  SET PC, POP

    ; Hang forever. X should now be 0x40 if everything went right.
    :crash        SET PC, crash`
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
