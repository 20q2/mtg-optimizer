import { Component, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'app-optimize',
  templateUrl: './optimize.component.html',
  styleUrls: ['./optimize.component.sass']
})
export class OptimizeComponent implements OnInit {
  manaCurve: {[key: string]: number} = {};
  chartOptions!: EChartsOption;

  ngOnInit(): void {
    this.chartOptions = {
      xAxis: {
        type: 'category',
        data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: [10, 20, 15, 30, 25],
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
}
