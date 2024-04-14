import { Component } from '@angular/core';
import {CardComponent} from "../core/card/card.component";
import {ButtonComponent} from "@feel/form";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-landingpage',
  standalone: true,
  imports: [
    CardComponent,
    ButtonComponent,
    RouterLink
  ],
  templateUrl: './landingpage.component.html',
  styleUrl: './landingpage.component.scss'
})
export class LandingpageComponent {

}
