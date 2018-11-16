import { combineLatest } from 'rxjs/operators/combineLatest';
import { Subject } from 'rxjs/Subject';
import { Directive, ElementRef, Input, Renderer2, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Directive({ selector: '[appLoader]' })
export class LoaderDirective implements OnInit {
    private readonly SPINNER_CLASS = 'spinner';
    private readonly SPINNER_ACTIVE_CLASS = 'spinner-active';
    private _isLoading$: BehaviorSubject<boolean>;
    private _isPostLoading$: Subject<boolean>;
    private _element: any;

    @Input('appLoaderPost') set appLoaderPost(value: Subject<boolean>) {
        this._isPostLoading$ = value;
    }

    @Input('appLoader') set appLoader(value: BehaviorSubject<boolean>) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this._isLoading$ = value;
    }

    constructor(
        private _el: ElementRef,
        private _renderer: Renderer2,
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef
    ) {}

    ngOnInit() {
        this._element = this._el.nativeElement.nextElementSibling;
        this._renderer.addClass(this._element, this.SPINNER_CLASS);
        const obs = this._isLoading$;

        if (this._isPostLoading$) {
            obs.pipe(
                combineLatest(this._isPostLoading$),
                map((data) => {
                    if (data[0] && data[1]) {
                        return true;
                    }
                    if (!data[0] && !data[1]) {
                        return false;
                    }
                    return;
                })
            ).subscribe(
                (bool) => this._toggleSpinner(bool),
                () => this._toggleSpinner(false)
            );
        } else {
            obs.subscribe(
                (bool) => this._toggleSpinner(bool),
                () => this._toggleSpinner(false)
            );
        }
    }

    private _toggleSpinner(isLoading: boolean): void {
        if (isLoading === undefined) {
            return;
        }
        if (isLoading) {
            this._renderer.addClass(this._element, this.SPINNER_ACTIVE_CLASS);
        } else {
            this._renderer.removeClass(this._element, this.SPINNER_ACTIVE_CLASS);
        }
    }
}
