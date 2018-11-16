import { SvgIconComponent } from './../svg/svg-icon.component';
import { Renderer2, ViewChild, AfterViewInit, ComponentFactoryResolver, ViewContainerRef, OnDestroy } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';

export abstract class GridComponentBase implements AfterViewInit, OnDestroy {
  private readonly OPEN_MASTER_DETAIL_CLASS = 'open-master-datail';
  private readonly GRID_TEMPLATE_NAME = 'data';
  private readonly EXPANDER_ICON = 'expander';
  private readonly EXPANDED_ICON_CLASS = 'expanded';
  private readonly WIDTH_EXPANDER = 50;
  private readonly HEADER_ROW_TYPE = 'header';
  private readonly CELL_OVERLAY_COPY_CLASS = 'cell-overlay-copy';

  @ViewChild('grid') grid: DxDataGridComponent;

  protected _destroy$: Subject<void> = new Subject();
  private _prevMasterDatail: number;

  constructor(
    public renderer: Renderer2,
    public resolver: ComponentFactoryResolver,
    public vcRef: ViewContainerRef
  ) { }

  ngAfterViewInit() {
    if (this.grid.masterDetail.template && this.grid.masterDetail.enabled === false) {
      this._createColumnExpander();

      this.grid.onCellClick.pipe(
        takeUntil(this._destroy$)
      ).subscribe((e) => {
        if (e.rowType === this.HEADER_ROW_TYPE) {
          this.collapseAll();
        }
      });

      this.grid.onRowClick.pipe(
        takeUntil(this._destroy$)
      ).subscribe(this._rowClick.bind(this));
    }
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  public collapseAll(): void {
    this.grid.instance.collapseAll(-1);
    this._prevMasterDatail = null;
  }

  private _rowClick(e): void {
    if (e.rowType !== this.GRID_TEMPLATE_NAME) {
      return;
    }
    if (e.event.target.classList.contains(this.CELL_OVERLAY_COPY_CLASS) ||
      e.event.target.parentElement.classList.contains(this.CELL_OVERLAY_COPY_CLASS)
    ) {
      return;
    }

    const instance = this.grid.instance.getRowElement(e.rowIndex) || {};
    const row = instance ? instance[0] : null;
    if (!row) {
      return;
    }
    if (e.component.isRowExpanded(e.key)) {
      e.component.collapseRow(e.key);
      this._prevMasterDatail = null;
      this._removeShadowBox(row);
    } else {
      e.component.expandRow(e.key);
      this._addShadowBox(row);
      if (this._prevMasterDatail !== null) {
        e.component.collapseRow(this._prevMasterDatail);
      }
      this._prevMasterDatail = e.key;
    }
  }

  private _addShadowBox(elem: Element): void {
    this.renderer.addClass(elem, this.OPEN_MASTER_DETAIL_CLASS);
  }

  private _removeShadowBox(elem: Element): void {
    this.renderer.removeClass(elem, this.OPEN_MASTER_DETAIL_CLASS);
  }

  private _createColumnExpander(): void {
    this.grid.instance.addColumn({
      width: this.WIDTH_EXPANDER,
      cellTemplate: (container, options) => {
        const factory = this.resolver.resolveComponentFactory(SvgIconComponent);
        const component = this.vcRef.createComponent(factory);

        component.instance.icon = this.EXPANDER_ICON;
        if (options.row.isExpanded) {
          component.instance.classCustom = this.EXPANDED_ICON_CLASS;
        }

        this.renderer.appendChild(container, component.location.nativeElement);
      }
    });
  }
}
