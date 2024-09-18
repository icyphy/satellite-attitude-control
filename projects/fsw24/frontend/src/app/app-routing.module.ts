import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SatelliteComponent} from "./satellite/satellite.component";
import {routes as satelliteRoutes} from "./satellite/satellite.routes";
import {routes as landingPageRoutes} from "./landingpage/landingpage.routes"

export const routes: Routes = [
  {path: 'satellite', children: satelliteRoutes},
  {path: '', children: landingPageRoutes}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
