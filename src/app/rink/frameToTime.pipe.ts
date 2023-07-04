import { Pipe, PipeTransform } from '@angular/core';

/**
 * A Pipe to convert the frame count to a countdown MM:SS.
 * @param value The current frame
 * @param totalTime The total amount of time on the countdown in seconds.
 */
@Pipe({
  name: 'frameToTime'
})
export class FrameToTimePipe implements PipeTransform {
  transform(value: number, totalTime: number): string {
    const seconds = totalTime - Math.round(value * (10/60));
    if(seconds < 0) return '0';
    return `${seconds > 600 ? Math.floor(seconds/600) + ' : ': ''}${Math.round(seconds % 600)/10}`;
  }
}
