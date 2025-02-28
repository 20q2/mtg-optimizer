import { Component, OnInit } from '@angular/core';
import { SpellChromaService } from '../services/spell-chroma.service';
import { AppMode } from '../model/app-mode';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent {
  AppMode = AppMode;
  
  constructor(public spellChromaService: SpellChromaService) {}
}
