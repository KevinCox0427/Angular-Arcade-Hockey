import { Pipe, PipeTransform } from '@angular/core';

/**
 * A Pipe to convert the frame count to seconds.
 */
@Pipe({
  name: 'frameToTime'
})
export class FrameToTimePipe implements PipeTransform {
  transform(value: number): number {
    return Math.round(value * (10/60)) / 10;
  }
}
