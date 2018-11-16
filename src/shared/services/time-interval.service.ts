import { Subject } from 'rxjs/Subject';
import { Injectable } from '@angular/core';
import { timer } from 'rxjs/observable/timer';
import { Subscriber } from 'rxjs/Subscriber';
import { Observable } from 'rxjs/Observable';
import { takeUntil } from 'rxjs/operators';

@Injectable()
export class TimeIntervalService {
  private _intervalsDictionary: { [period: number]: Observable<number> } = {};
  private _countSubscriptionsDictionary: { [period: number]: number } = {};

  constructor() {}

  public getInterval(period: number): Observable<number> {
    if (this._intervalsDictionary[period]) {
      return this._intervalsDictionary[period];
    }
    this._countSubscriptionsDictionary[period] = 0;
    this._intervalsDictionary[period] = this._subscriberCount(period);
    return this._intervalsDictionary[period];
  }

  private _subscriberCount(period: number): Observable<number> {
    const stopInterval$: Subject<void> = new Subject();
    const timer$ = timer(period, period).pipe(takeUntil(stopInterval$));

    return Observable.create((subscriber: Subscriber<number>) => {
      const subscription = timer$.subscribe(subscriber);
      this._countSubscriptionsDictionary[period]++;
      return () => {
        subscription.unsubscribe();
        this._countSubscriptionsDictionary[period]--;
        if (this._countSubscriptionsDictionary[period] === 0) {
          stopInterval$.next();
          stopInterval$.complete();
        }
      };
    });
  }
}
