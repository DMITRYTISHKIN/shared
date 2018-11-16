
import { Directive, ElementRef, Input, SimpleChanges, Renderer2, OnInit, OnChanges } from '@angular/core';

import { Position } from '../../models/gallery/position.type';

@Directive({ selector: '[appGalleryZoom]' })
export class GalleryZoomDirective implements OnChanges, OnInit {
  private readonly BACKGROUND_REPEAT = 'background-repeat';
  private readonly BACKGROUND_IMAGE = 'background-image';
  private readonly BACKGROUND_POSITION = 'background-position';
  private readonly BACKGROUND_SIZE = 'background-size';
  private readonly NO_REPEAT = 'no-repeat';

  public el: HTMLImageElement;

  @Input() backgroundSrc: string;

  @Input() xPos = 0;
  @Input() yPos = 0;

  @Input() xMax = 346;
  @Input() yMax = 520;

  @Input() sizeArea = 100;
  @Input() sizeAreaOrigin = 300;

  constructor(
    el: ElementRef,
    private _renderer: Renderer2
  ) {
    this.el = el.nativeElement;
    this._renderer.setStyle(this.el, 'transition', 'all 10ms');
  }

  ngOnInit() {
    this._renderer.setStyle(this.el, this.BACKGROUND_REPEAT, this.NO_REPEAT);
    this._onLoadAndRefresh();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.backgroundSrc) {
      this._onLoadAndRefresh();
      this._renderer.setStyle(this.el, this.BACKGROUND_IMAGE, this._buildBackground(this.backgroundSrc));
    }

    if (changes.xMax || changes.yMax) {
      this._refreshBackground();
    }

    if ((changes.xPos || changes.yPos) && this.backgroundSrc) {
      this._renderer.setStyle(this.el, this.BACKGROUND_POSITION, this._buildPosition(this._getPos(this.xPos, this.yPos)));
    }
  }

  private _onLoadAndRefresh(): void {
    const image = new Image();
    image.src = this.backgroundSrc;
    image.onload = () => {
      this._refreshBackground();
    };
  }

  private _refreshBackground(): void {
    const size = this.xMax * (this.sizeAreaOrigin / this.sizeArea);
    this._renderer.setStyle(this.el, this.BACKGROUND_SIZE, `${size}px`);
  }

  private _buildPosition(position: Position): string {
    return `${-position.x}px ${-position.y}px`;
  }

  private _buildBackground(src: string): string {
    return `url(${src})`;
  }

  private _getPos(xPos, yPos): Position {
    let x = xPos - (this.sizeArea / 2);
    let y = yPos - (this.sizeArea / 2);

    if (x < 0) {
      x = 0;
    } else if (x + this.sizeArea > this.xMax) {
      x = this.xMax - this.sizeArea;
    }

    if (y < 0) {
      y = 0;
    } else if (y + this.sizeArea > this.yMax) {
      y = this.yMax - this.sizeArea;
    }

    const diffArea = this.sizeAreaOrigin / this.sizeArea;

    x *= diffArea;
    y *= diffArea;

    return { x, y };
  }
}
