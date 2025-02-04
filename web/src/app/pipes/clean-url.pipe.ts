import {Pipe, PipeTransform} from '@angular/core';
import CleanUrl from '../utils/clean-url';

@Pipe({
  name: 'cleanUrl'
})
export class CleanUrlPipe implements PipeTransform {

  transform(value?: string | string[] | null, ...args: unknown[]): unknown {
    return CleanUrl.transform(value);
  }

}
