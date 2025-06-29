import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replacePlaceholder',
  pure: true // default, only re-runs on input changes
})
export class ReplacePlaceholderPipe implements PipeTransform {
  transform(value: string, replacements: { [key: string]: string }): string {
    if (!value) return '';
    for (const key in replacements) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      value = value.replace(placeholder, replacements[key]);
    }
    return value;
  }
}
