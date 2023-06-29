import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { PlayerComponent } from './player/player.component';
import { RinkComponent } from './rink/rink.component';
import { FrameToTimePipe } from './rink/frameToTime.pipe';

@NgModule({
  declarations: [
    AppComponent,
    PlayerComponent,
    RinkComponent,
    FrameToTimePipe
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
