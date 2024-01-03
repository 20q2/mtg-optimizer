import { Component, OnInit } from '@angular/core';
import { SpellChromaService } from '../services/spell-chroma.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent {
 
  constructor(public spellChromaService: SpellChromaService) {}
}
