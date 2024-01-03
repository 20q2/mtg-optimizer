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
import {MatSnackBarModule} from '@angular/material/snack-bar'
import { SnackbarService } from './services/snackbar.service';
import { LandingComponent } from './pages/landing/landing.component';
import { OptimizeComponent } from './optimize/optimize.component';
import { ExploreComponent } from './explore/explore.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReplacePlaceholderDirective } from './directives/mana-symbol.directive';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TagAddComponent } from './tag-add/tag-add.component';
import { MatInputModule } from '@angular/material/input';
import { KeyValuePipe } from '@angular/common';
import { WelcomeComponent } from './welcome/welcome.component';




@NgModule({
  declarations: [
    AppComponent,
    ColorIdentityPickerComponent,
    CardGridComponent,
    ManaCurveComponent,
    LandingComponent,
    OptimizeComponent,
    ExploreComponent,
    ReplacePlaceholderDirective,
    TagAddComponent,
    WelcomeComponent
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
    NgxEchartsModule.forRoot({ echarts: () => import('echarts') }),
    MatSnackBarModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    
  ],
  providers: [SnackbarService, KeyValuePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
