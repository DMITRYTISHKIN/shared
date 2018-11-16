import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { takeUntil } from 'rxjs/operators/takeUntil';
export class Helpers {
    public static untilDestroyed = (instance, destroyName = 'ngOnDestroy') => {
        return <T>(source: Observable<T>) => {
            const originalDestroy = instance[destroyName];
            if (Helpers.isFunction(originalDestroy) === false) {
                throw new Error(`${instance.constructor.name} is using untilDestroyed but doesn't implement ${destroyName}`);
            }
            if (!instance['__takeUntilDestroy']) {
                instance['__takeUntilDestroy'] = new Subject();
                instance[destroyName] = function() {
                if (Helpers.isFunction(originalDestroy)) {
                    originalDestroy.apply(instance, arguments);
                }
                this['__takeUntilDestroy'].next(true);
                this['__takeUntilDestroy'].complete();
            };
            }
            return source.pipe(takeUntil<T>(instance['__takeUntilDestroy']));
        };
    }
    public static isFunction = (value) => {
        return typeof value === 'function';
    }
}
