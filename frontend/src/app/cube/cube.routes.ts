import {Routes} from '@angular/router';
import {CubeComponent} from './cube.component';

export const routes: Routes = [
  {path: '', component: CubeComponent},
  //{path: 'noten', loadChildren: () => import('./noten/noten.module').then(m => m.NotenModule)},
];
