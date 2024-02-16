import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { EChartsOption } from 'echarts';
import { SpellChromaService } from '../services/spell-chroma.service';
import { ScryfallService } from '../services/scryfall.service';
import { ManaCurveComponent } from '../mana-curve/mana-curve.component';
import { ManaCurveService } from '../services/mana-curve.service';
import { ScryfallCardObject } from '../model/tag-objects';

@Component({
  selector: 'app-optimize',
  templateUrl: './optimize.component.html',
  styleUrls: ['./optimize.component.scss']
})
export class OptimizeComponent implements OnInit {
  @Output()
  cmcButtonClickEmitter: EventEmitter<number> = new EventEmitter<number>();

  manaCurve: {[key: string]: number} = {};
  chartOptions!: EChartsOption;
  optimalChartOptions!: EChartsOption;

  deckOptimalCurve: {[key: number | string]: number} = {};

  highValueTags: string[] = ['draw', 'ramp', 'removal'];
  warningMessage: string= '';

  constructor(
    public spellChromaService: SpellChromaService,
    private scryfallService: ScryfallService, 
    private manaCurveService: ManaCurveService   
  ) {}

  ngOnInit(): void {
    this.getOptimalDeckCurve();
    const warningTags = this.checkHighValueTags();
    if (warningTags.length !== 0) {
      this.warningMessage = `The following tags are missing from your deck: ${warningTags.join(', ')}`;
    }

    for (let card of this.spellChromaService.deck) {
      // if (card.type_line.toLocaleLowerCase().includes('land')) {
      //   continue;
      // }
      
      this.updateManaCurve(card);
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

  checkHighValueTags(): string[] {
    let missingTags = this.highValueTags;
    for (const key of Object.keys(this.spellChromaService.tags)) {
      if (this.highValueTags.includes(key)) {
        missingTags = missingTags.filter(item => item !== key);
      }
      
    }
    return missingTags;
  }

  // Find cards that stand out and dont really fit with the rest of the deck
  findLoneCards() {

  }


  updateManaCurve(card: ScryfallCardObject) {
    const number = card.cmc;
    let numberString = number.toString();

    if (numberString === '0' && card.type_line.includes('Land')) {
      numberString = 'land';
    }

    if (!this.manaCurve[numberString]) {
      this.manaCurve[numberString] = 1;
    } else {
      this.manaCurve[numberString]++;
    }
  }

  getOptimalDeckCurve() {
    this.deckOptimalCurve = this.manaCurveService.ideal60;
  }

  onCmcButtonClick(event: number | string) {
    if (event === 'land') {
      event = -1;
    }
    this.cmcButtonClickEmitter.emit(Number(event));
  }

  getDifference(key: string): number {
    return this.manaCurve[key] - this.deckOptimalCurve[key];
  }
}
