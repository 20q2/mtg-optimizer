import { Component, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';
import { SpellChromaService } from '../services/spell-chroma.service';
import { ScryfallService } from '../services/scryfall.service';
import { ManaCurveComponent } from '../mana-curve/mana-curve.component';
import { ManaCurveService } from '../services/mana-curve.service';

@Component({
  selector: 'app-optimize',
  templateUrl: './optimize.component.html',
  styleUrls: ['./optimize.component.scss']
})
export class OptimizeComponent implements OnInit {
  manaCurve: {[key: string]: number} = {};
  chartOptions!: EChartsOption;
  optimalChartOptions!: EChartsOption;

  deckOptimalCurve: {[key: number | string]: number} = {};

  constructor(
    public spellChromaService: SpellChromaService,
    private scryfallService: ScryfallService, 
    private manaCurveService: ManaCurveService   
  ) {}

  ngOnInit(): void {
    this.getOptimalDeckCurve();

    for (let card of this.spellChromaService.deck) {
      if (card.type_line.toLocaleLowerCase().includes('land')) {
        continue;
      }
      
      this.updateManaCurve(card.cmc);
    }

    this.chartOptions = {
      xAxis: {
        type: 'category',
        data: Object.keys(this.manaCurve),
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: Object.keys(this.manaCurve).map(key => this.manaCurve[key]),          
          type: 'bar',
        },
      ],
    };

    this.optimalChartOptions = {
      xAxis: {
        type: 'category',
        data: Object.keys(this.deckOptimalCurve),
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: Object.keys(this.deckOptimalCurve).map(key => this.deckOptimalCurve[key]),          
          type: 'bar',
        },
      ],
    };
  }

  updateManaCurve(number: number) {
    if (!this.manaCurve[number.toString()]) {
      this.manaCurve[number.toString()] = 1;
    } else {
      this.manaCurve[number.toString()]++;
    }
  }

  getOptimalDeckCurve() {
    this.deckOptimalCurve = this.manaCurveService.ideal60;
  }
}
