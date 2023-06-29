import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'frameToTime'
})
export class FrameToTimePipe implements PipeTransform {
  transform(value: number): number {
    return Math.round(value * (10/60)) / 10;
  }
}
