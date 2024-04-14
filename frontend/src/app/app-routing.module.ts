import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CubeComponent} from "./cube/cube.component";
import {routes as cubeRoutes} from "./cube/cube.routes";

export const routes: Routes = [
  {path: 'cube', children: cubeRoutes}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
