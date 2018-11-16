import { take } from 'rxjs/operators';
import { Component, OnInit, Input, ViewChild } from '@angular/core';

import { DxGalleryComponent, DxPopoverComponent } from 'devextreme-angular';

import { SvgIconComponent } from '../icons/svg-icon/svg-icon.component';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.less']
})
export class GalleryComponent implements OnInit {
  public readonly WIDTH_PADDING = 226;
  public readonly HEIGHT_PADDING = 80;
  private readonly WIDTH_POPUP = 572;
  private readonly HEIGHT_POPUP = 600;
  private readonly MAX_WIDTH_POPUP_PERCENT = 40;
  private readonly MAX_HEIGHT_POPUP_PERCENT = 90;
  private readonly DISABLED_CLASS = 'disabled';

  @ViewChild('popup') popup: DxPopoverComponent;
  @ViewChild('gallery') gallery: DxGalleryComponent;
  @ViewChild('prevButton') prevButton: SvgIconComponent;
  @ViewChild('nextButton') nextButton: SvgIconComponent;

  @Input() currentImage: string;
  @Input() sizeArea = 100;
  @Input() sizeAreaOriginal = 300;
  @Input() dataSource: string[] = [];
  @Input() popupVisible = false;
  @Input() galleryVisible = false;
  @Input() minWidth = this.WIDTH_POPUP;
  @Input() minHeight = this.HEIGHT_POPUP;

  public width: number;
  public height: number;
  public maxWidthPercent: number;
  public maxHeightPercent: number;

  public currentIndex = 0;
  public isShowZoom = false;
  public isMultipe = false;
  public xPos: number;
  public yPos: number;
  public xMax: number;
  public yMax: number;

  constructor() {}

  ngOnInit() {
    this.currentImage = this.dataSource[this.currentIndex];
  }

  public close(): void {
    this.popupVisible = false;
  }

  public open(index: number, dataSource: string[]): void {
    this.dataSource = dataSource;
    this.isMultipe = dataSource.length > 1;
    this.currentIndex = index;
    this.currentImage = this.dataSource[this.currentIndex];
    this._detectSizePopover();
  }

  public onSelectionChanged(e): void {
    this.currentImage = e.addedItems[0];
    this.currentIndex = this.dataSource.indexOf(this.currentImage);
    this._toggleDisableButtons();
  }

  public onPrevImage(): void {
    const prevIndex = this.dataSource.indexOf(this.currentImage) - 1;
    if (prevIndex < 0) {
      return;
    }

    this.gallery.selectedIndex = prevIndex;
    this.currentIndex = this.gallery.selectedIndex;
    this._toggleDisableButtons();
  }

  public onNextImage(): void {
    const nextIndex = this.dataSource.indexOf(this.currentImage) + 1;
    if (nextIndex >= this.dataSource.length) {
      return;
    }

    this.gallery.selectedIndex = nextIndex;
    this.currentIndex = this.gallery.selectedIndex;
    this._toggleDisableButtons();
  }

  public onZoomImage(e: MouseEvent): void {
    this.xPos = e.offsetX;
    this.yPos = e.offsetY;
  }

  public onEnterZoom(e): void {
    this.isShowZoom = true;
    this.xMax = e.currentTarget.offsetWidth;
    this.yMax = e.currentTarget.offsetHeight;
  }

  public onLeaveZoom(): void {
    this.isShowZoom = false;
  }

  private _detectSizePopover(): void {
    const sizes = [];
    this.width = this.WIDTH_POPUP;
    this.height = this.HEIGHT_POPUP;
    this.maxWidthPercent = this.MAX_WIDTH_POPUP_PERCENT;
    this.maxHeightPercent = this.MAX_HEIGHT_POPUP_PERCENT;

    this.dataSource.forEach((img) => {
      const image = new Image();
      image.src = img;
      image.onload = () => {
        if (image.width > this.width) {
          this.width = image.width;
        }
        if (image.height > this.height) {
          this.height = image.height;
        }

        sizes.push({
          x: image.width,
          y: image.height
        });

        if (sizes.length !== this.dataSource.length) {
          return;
        }

        const proportions = sizes.reduce((prev, item) => {
          prev.x += item.x;
          prev.y += item.y;
          return prev;
        }, { x: 0, y: 0 });

        proportions.x = proportions.x / this.dataSource.length;
        proportions.y = proportions.y / this.dataSource.length;

        if (proportions.x > this.minWidth) {
          proportions.y = (this.maxWidthPercent / proportions.x) * proportions.y;
          proportions.x = this.maxWidthPercent;
        }
        if (proportions.y > this.maxHeightPercent || proportions.y > this.minHeight) {
          proportions.x = (this.maxHeightPercent / proportions.y) * proportions.x;
          proportions.y = this.maxHeightPercent;
        }

        this.maxWidthPercent = proportions.x;
        this.maxHeightPercent = proportions.y;
        this.popup.onShowing.pipe(take(1)).subscribe(() => this.galleryVisible = true);
        this.popupVisible = true;
      };
    });
  }

  private _toggleDisableButtons(): void {
    if (!this.nextButton || !this.prevButton) {
      return;
    }

    if (this.currentIndex === this.dataSource.length - 1) {
      this.nextButton.addClassName(this.DISABLED_CLASS);
    } else {
      this.nextButton.removeClassName(this.DISABLED_CLASS);
    }

    if (this.currentIndex === 0) {
      this.prevButton.addClassName(this.DISABLED_CLASS);
    } else {
      this.prevButton.removeClassName(this.DISABLED_CLASS);
    }
  }
}
