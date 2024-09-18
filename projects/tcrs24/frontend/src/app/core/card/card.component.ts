import {Component, HostBinding, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {

  @Input()
  public backgroundImage: string | undefined | null;

  @Input()
  public link: string | undefined | null;

  @Input()
  public inverseShadow: boolean = false;

  @Input()
  @HostBinding("class.light-shadow")
  public lightShadow: boolean = false;

  protected isExternal(): boolean {
    if (!this.link) {
      return false;
    }

    try {
      new URL(this.link);
      return true;
    } catch (d) {
      return false;
    }
  }

  protected buildBackgroundImageUrl(url: string | undefined | null): string | null {
    return url
      ? `url(${url})`
      : null;
  }
}
