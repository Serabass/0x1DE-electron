import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hexValue'
})
export class HexValuePipe implements PipeTransform {
  transform(value: any): any {
    const hex = value.toString(16);
    return '0'.repeat(4 - hex.length) + hex;
  }
}
