import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatButtonModule} from '@angular/material/button';
import { NgxEchartsModule } from 'ngx-echarts';
import {MatIconModule} from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ColorIdentityPickerComponent } from './color-identity-picker/color-identity-picker.component';
import { CardGridComponent } from './card-grid/card-grid.component';
import { ManaCurveComponent } from './mana-curve/mana-curve.component';
@NgModule({
  declarations: [
    AppComponent,
    ColorIdentityPickerComponent,
    CardGridComponent,
    ManaCurveComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    BrowserAnimationsModule,
    NgxEchartsModule.forRoot({ echarts: () => import('echarts') })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
