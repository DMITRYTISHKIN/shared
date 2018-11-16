import { ObjectHelper } from './../../extensions/object.extensions';
import { filter } from 'rxjs/operators/filter';
import { debounceTime } from 'rxjs/operators/debounceTime';
import { ElementRef, EventEmitter, Input, Renderer2, Component, ViewChild, Output, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-transition-container',
  templateUrl: './transition-container.component.html',
  styleUrls: ['./transition-container.component.less']
})
export class TransitionContainerComponent implements OnInit, OnDestroy {
  private readonly TRANSITIONEND_EVENT = 'transitionend';
  private readonly HEIGHT = 'height';

  @ViewChild('animatedContainer') animatedContainer: ElementRef;

  @Input('onChanged') onChanged: EventEmitter<void>;
  @Output('transitionEnd') transitionEnd: EventEmitter<void> = new EventEmitter();

  public refreshHeight$: Subject<void> = new Subject();
  private _currentHeight;
  private _mutationOserver: MutationObserver;

  constructor (
    private el: ElementRef,
    private _renderer: Renderer2
    ) { }

  ngOnInit() {
    this.refreshHeight$.pipe(
      ObjectHelper.untilDestroyed(this),
      debounceTime(10),
      filter(() => this._currentHeight !== this.animatedContainer.nativeElement.offsetHeight),
    ).subscribe(() => {
      this._currentHeight = this.animatedContainer.nativeElement.offsetHeight;
      this._renderer.setStyle(this.el.nativeElement,
          this.HEIGHT, `${this._currentHeight}px`);
    });

    this.el.nativeElement.addEventListener(this.TRANSITIONEND_EVENT, this._onEmitFocusEvent.bind(this));

    this._mutationOserver = new MutationObserver(() => {
      this.refreshHeight$.next();
    });

    this._mutationOserver.observe(this.el.nativeElement, {
      childList: true,
      subtree: true,
      attributes: true
    });
  }

  ngOnDestroy() {
    this._mutationOserver.disconnect();
    this.el.nativeElement.removeEventListener(this.TRANSITIONEND_EVENT, this._onEmitFocusEvent.bind(this));
  }

  private _onEmitFocusEvent(): void {
    this.transitionEnd.emit();
  }
}
