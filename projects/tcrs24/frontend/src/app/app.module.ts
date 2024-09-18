import {NgModule} from '@angular/core';
import {BrowserModule, provideClientHydration} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {RouterLink, RouterOutlet} from "@angular/router";
import {AppRoutingModule} from "./app-routing.module";
import {SatelliteComponent} from "./satellite/satellite.component";
import {NotificationListComponent} from "@feel/notification";

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    RouterOutlet,
    RouterLink,
    AppRoutingModule,
    NotificationListComponent,
  ],
  providers: [provideClientHydration()],
  bootstrap: [AppComponent]
})
export class AppModule {
}

