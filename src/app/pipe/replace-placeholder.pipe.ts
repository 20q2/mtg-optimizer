import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'replacePlaceholder',
  pure: true // Only re-runs when inputs change
})
export class ReplacePlaceholderPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(text: string): SafeHtml {
    if (!text) return '';

    const placeholderMap: { [key: string]: string } = {
      '\\{W\\}': '<span class="mana-symbol small white"></span>',
      '\\{U\\}': '<span class="mana-symbol small blue"></span>',
      '\\{B\\}': '<span class="mana-symbol small black"></span>',
      '\\{R\\}': '<span class="mana-symbol small red"></span>',
      '\\{G\\}': '<span class="mana-symbol small green"></span>',
      '\\{1\\}': '<span class="mana-symbol small one"></span>',
      '\\{2\\}': '<span class="mana-symbol small two"></span>',
      '\\{3\\}': '<span class="mana-symbol small three"></span>',
      '\\{4\\}': '<span class="mana-symbol small four"></span>',
      '\\{5\\}': '<span class="mana-symbol small five"></span>',
      '\\{6\\}': '<span class="mana-symbol small six"></span>',
      '\\{7\\}': '<span class="mana-symbol small seven"></span>',
      '\\{T\\}': '<span class="mana-symbol small tap"></span>',
      '\\{X\\}': '<span class="mana-symbol small x"></span>',
    };

    for (const placeholder in placeholderMap) {
      text = text.replace(new RegExp(placeholder, 'gu'), placeholderMap[placeholder]);
    }

    return this.sanitizer.bypassSecurityTrustHtml(text);
  }
}
