import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Component, Input, forwardRef, ChangeDetectionStrategy, Output, EventEmitter, ViewChild,
  ElementRef, Renderer2, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-select-grid',
  templateUrl: './select-grid.component.html',
  styleUrls: ['./select-grid.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectGridComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectGridComponent implements OnChanges, ControlValueAccessor {
  private readonly GRID_TEMPLATE_ROWS = 'grid-template-rows';

  @ViewChild('gridContainer') gridContainer: ElementRef;

  @Output() selectItem: EventEmitter<any> = new EventEmitter();
  @Output() deselectItem: EventEmitter<any> = new EventEmitter();
  @Output() changeSelection: EventEmitter<any[]> = new EventEmitter();

  @Input() mulitiple = false;
  @Input() value: any[] | any;
  @Input() data: any[];
  @Input() keyName = 'name';

  @Input() minRows: number;
  @Input() maxColumns: number;
  @Input() noData = 'Нет данных';

  constructor(
    private _renderer: Renderer2
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data && changes.data.currentValue && this.gridContainer) {
      this._setGridTemplateRows();
    }
  }

  onChange: any = () => {};

  onTouched: any = () => {};

  writeValue(value: any) {
    this.value = value;
    this.onChange(value);
  }

  registerOnChange(fn) {
    this.onChange = fn;
  }

  registerOnTouched(fn) {
    this.onTouched = fn;
  }

  public onClick(item: any): void {
    if (this._hasValue(item)) {
      this.writeValue(this._removeItem(item));
      this.deselectItem.emit(item);
    } else {
      this.writeValue(this._setItem(item));
      this.selectItem.emit(item);
    }
    this.changeSelection.emit(this.value);
  }

  private _setItem(item): any[] {
    this.selectItem.emit(this.value);
    return this.mulitiple ? this.value.concat(item) : item;
  }

  private _removeItem(item): any[] {
    return this.mulitiple ? this.value.filter(i => i !== item) : null;
  }

  private _hasValue(item): boolean {
    return (this.mulitiple && this.value.indexOf(item) !== -1) || this.value === item;
  }

  private _setGridTemplateRows(): void {
    if (!this.data) {
      return;
    }
    let count = Math.round(this.data.length / this.maxColumns);
    if (this.data.length < this.minRows) {
      count = this.data.length;
    } else if (count < this.minRows) {
      count = this.minRows;
    }

    this._renderer.setStyle(
      this.gridContainer.nativeElement,
      this.GRID_TEMPLATE_ROWS,
      `repeat(${count}, auto)`
    );
  }
}
