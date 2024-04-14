import { Component } from '@angular/core';
import {CardComponent} from "../core/card/card.component";
import {ButtonComponent} from "@feel/form";
import {RouterLink} from "@angular/router";
import {IconUcbComponent} from "../icons/icon-ucb/icon-ucb.component";
import {IconNtnuComponent} from "../icons/icon-ntnu/icon-ntnu.component";
import {IconTudComponent} from "../icons/icon-tud/icon-tud.component";

@Component({
  selector: 'app-landingpage',
  standalone: true,
  imports: [
    CardComponent,
    ButtonComponent,
    RouterLink,
    IconUcbComponent,
    IconNtnuComponent,
    IconTudComponent
  ],
  templateUrl: './landingpage.component.html',
  styleUrl: './landingpage.component.scss'
})
export class LandingpageComponent {

}
