import { Position } from './position.type';
import { Directive, ElementRef, Input, HostListener, OnInit, Renderer2 } from '@angular/core';

@Directive({ selector: '[appGalleryCursor]' })
export class GalleryCursorDirective implements OnInit {
  private readonly TAG_NAME = 'div';
  private readonly VISIBILITY = 'visibility';
  private readonly VISIBLE = 'visible';
  private readonly HIDDEN = 'hidden';
  private readonly TOP = 'top';
  private readonly LEFT = 'left';
  private readonly GALLERY_CURSOR = 'gallery-cursor';
  private readonly ID = 'id';

  public el: HTMLElement;
  public parent: HTMLElement;
  public cursor: HTMLElement;

  private offsetBorderHeight = 50;
  private offsetBorderWidth = 50;

  private widthMarginPos = 0;
  private heightMarginPos = 0;

  @Input() sizeArea = 100;

  @HostListener('mouseleave') onMouseLeave() {
    this._renderer.setStyle(this.cursor, this.VISIBILITY, this.HIDDEN);
  }

  @HostListener('mouseenter') onMouseEnter() {
    this._renderer.setStyle(this.cursor, this.VISIBILITY, this.VISIBLE);
    this.offsetBorderHeight = this.el.offsetHeight - this.sizeArea;
    this.offsetBorderWidth = this.el.offsetWidth - this.sizeArea;
    this._resetMarginPos();
  }

  @HostListener('mousemove', ['$event']) onMouseMove(e: MouseEvent) {
    const { x, y } = this._getPosition(e.offsetX, e.offsetY);
    this._renderer.setStyle(this.cursor, this.LEFT, `${x}px`);
    this._renderer.setStyle(this.cursor, this.TOP, `${y}px`);
  }

  constructor(
    el: ElementRef,
    private _renderer: Renderer2
  ) {
    this.el = el.nativeElement;
    this.parent = this.el.parentElement;
  }

  ngOnInit() {
    this.cursor = this._renderer.createElement(this.TAG_NAME);
    this._renderer.setAttribute(this.cursor, this.ID, this.GALLERY_CURSOR);
    this._renderer.addClass(this.cursor, this.GALLERY_CURSOR);
    this._renderer.setStyle(this.cursor, this.VISIBILITY, this.HIDDEN);

    this.parent.appendChild(this.cursor);
  }

  private _resetMarginPos(): void {
    if (this.el.offsetWidth < this.parent.offsetWidth) {
      this.widthMarginPos = (this.parent.offsetWidth - this.el.offsetWidth) / 2;
    } else {
      this.widthMarginPos = 0;
    }
    if (this.el.offsetHeight < this.parent.offsetHeight) {
      this.heightMarginPos = (this.parent.offsetHeight - this.el.offsetHeight) / 2;
    } else {
      this.heightMarginPos = 0;
    }
  }

  private _getPosition(xPos: number, yPos: number): Position {
    let x = xPos - (this.sizeArea / 2);
    let y = yPos - (this.sizeArea / 2);

    if (x < 0) {
      x = 0;
    } else if (x > this.offsetBorderWidth) {
      x = this.offsetBorderWidth;
    }

    if (y <= 0) {
      y = 0;
    } else if (y > this.offsetBorderHeight) {
      y = this.offsetBorderHeight;
    }

    x += this.widthMarginPos;
    y += this.heightMarginPos;

    return { x, y };
  }
}
