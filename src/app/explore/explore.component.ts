import { Component, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';
import { SpellChromaService } from '../services/spell-chroma.service';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.sass']
})
export class ExploreComponent {
 
  constructor(public spellChromaService: SpellChromaService) {}
}
