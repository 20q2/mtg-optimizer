import { Directive, ElementRef, Renderer2, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appReplacePlaceholder]'
})
export class ReplacePlaceholderDirective implements AfterViewInit {

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    const text = this.el.nativeElement.textContent;
    const replacedText = this.replacePlaceholdersWithImages(text);
    this.renderer.setProperty(this.el.nativeElement, 'textContent', '');
    this.renderer.appendChild(this.el.nativeElement, document.createRange().createContextualFragment(replacedText));
  }

  private replacePlaceholdersWithImages(text: string): string {
    const placeholderMap: {[key: string]: string} = {
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

    // Replace placeholders with image tags
    for (const placeholder in placeholderMap) {
        text = text.replace(new RegExp(placeholder, 'gu'), placeholderMap[placeholder] );      
    }

    return text;
  }
}