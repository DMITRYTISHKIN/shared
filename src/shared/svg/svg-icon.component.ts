import { Helpers } from './../helpers';
import { SvgIconService } from './svg-icon.service';
import { Component, Input, OnInit, ElementRef, Renderer2, Inject, OnDestroy,
  ChangeDetectionStrategy, OnChanges, Output } from '@angular/core';
import { filter, map, share } from 'rxjs/operators';
declare var require: any;

@Component({
  selector: 'app-svg-icon',
  template: '',
  styleUrls: ['./svg-icon.component.less'],
  changeDetection:  ChangeDetectionStrategy.OnPush
})
export class SvgIconComponent implements OnInit, OnDestroy, OnChanges {
  private readonly STROKE_WIDTH = 'stroke-width';
  private readonly HEIGHT = 'height';
  private readonly FILL = 'fill';
  private readonly STROKE = 'stroke';
  private readonly STYLE_OVERRIDE_CLASS = 'style-override';

  @Input() fill: string;
  @Input() stroke: string;
  @Input() strokeWidth: string;
  @Input() iconHeight: string;
  @Input() classCustom = '';
  @Input() icon;
  @Output() iconClick;
  public iconClicked;

  public element: SVGElement;

  constructor(
    @Inject('svgIconProvide') private _service: SvgIconService,
    private _elementRef: ElementRef,
    private _renderer: Renderer2
  ) {
  }

  ngOnInit() {
    const name = require(`./icons/${this.icon}.svg`);
    this._service.getSvg(`${window.location.origin}/${name}`).pipe(
      Helpers.untilDestroyed(this),
      filter(element => element !== null),
      share(),
      map((element) => this._setAttrs(element))
    ).subscribe((svg) => {
      if (this.iconClick) {
        svg.addEventListener('click', this.iconClicked.bind(this));
      }
      this.element = svg;
      this._renderer.appendChild(this._elementRef.nativeElement, this.element);
    });
  }

  ngOnDestroy() {
    if (this.iconClick) {
      this.element.removeEventListener('click', this.iconClicked.bind(this));
    }
  }

  ngOnChanges() {
    if (this.element) {
      this._setAttrs(this.element);
    }
  }

  public addClassName(className: string): void {
    this._renderer.addClass(this.element, className);
    this.classCustom = className;
  }

  public removeClassName(className: string): void {
    this._renderer.removeClass(this.element, className);
    this.classCustom = '';
  }

  private _setAttrs(element: SVGElement): SVGElement {
    if (this.strokeWidth) {
      this._renderer.setStyle(element, this.STROKE_WIDTH, this.strokeWidth);
    }

    if (this.iconHeight) {
      this._renderer.setStyle(element, this.HEIGHT, this.iconHeight);
    }

    if (this.classCustom) {
      this._renderer.addClass(element, this.classCustom);
    }

    if (this.fill || this.stroke) {
      for (let i = 0; i < element.children.length; i++) {
        if (element.children.item(i).classList.contains(this.STYLE_OVERRIDE_CLASS)) {
          this._renderer.setStyle(element.children.item(i), this.FILL, this.fill);
          this._renderer.setStyle(element.children.item(i), this.STROKE, this.stroke);
        }
      }
    }

    return element;
  }
}
