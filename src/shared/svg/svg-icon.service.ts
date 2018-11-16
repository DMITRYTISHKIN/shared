import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { map, share, switchMap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

@Injectable()
export class SvgIconService {
  private static _cache: Map<string, SVGElement> = new Map();
  private static _inProgressReqs: Map<string, Observable<SVGElement>> = new Map();

  private readonly DIV_CONTAINER = 'DIV';
  private readonly SVG_TAG_SELECTOR = 'svg';

  constructor(
    private _http: HttpClient
  ) { }

  public loadSvg(url: string): Observable<SVGElement> {
    if (SvgIconService._inProgressReqs.has(url)) {
      return SvgIconService._inProgressReqs.get(url);
    }

    const req = this._http.get(url, { responseType: 'text' }).pipe(
      share(),
      map((textSvg) => {
        const svg = this._parseSvgElement(textSvg);
        SvgIconService._cache.set(url, svg);
        SvgIconService._inProgressReqs.delete(url);
        return svg;
      })
    );

    SvgIconService._inProgressReqs.set(url, req);

    return req;
  }

  public getSvg(url: string): Observable<SVGElement> {
    return of(SvgIconService._cache.get(url)).pipe(
      switchMap((value) => {
        if (!value) {
          return this.loadSvg(url);
        }
        return of(value);
      }),
      map((svg) => {
        return svg.cloneNode(true) as SVGElement;
      })
    );
  }

  private _parseSvgElement(str: string): SVGElement {
    const div = document.createElement(this.DIV_CONTAINER);
    div.innerHTML = str;

    const svg = div.querySelector(this.SVG_TAG_SELECTOR) as SVGElement;

    return svg;
  }
}
