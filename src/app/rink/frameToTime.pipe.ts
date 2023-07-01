import { Pipe, PipeTransform } from '@angular/core';

/**
 * A Pipe to convert the frame count to MM:SS.
 */
@Pipe({
  name: 'frameToTime'
})
export class FrameToTimePipe implements PipeTransform {
  transform(value: number): string {
    const seconds = Math.round(value * (10/60));
    return `${seconds > 600 ? Math.floor(seconds/600) + ':': ''}${Math.round(seconds % 600)/10}`;
  }
}
