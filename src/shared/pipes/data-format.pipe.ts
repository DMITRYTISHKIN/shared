import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormatParse'
})
export class DateFormatPipe implements PipeTransform {
  protected readonly units = {
    'YYYY': {
      year: 'numeric'
    },
    'YY': {
      year: '2-digit'
    },
    'M': {
      month: 'numeric'
    },
    'MM': {
      month: '2-digit'
    },
    'MMM': {
      month: 'short'
    },
    'MMMM': {
      month: 'long'
    },
    'D': {
      day: 'numeric'
    },
    'DD': {
      day: '2-digit'
    },
    'hh': {
      hour: '2-digit'
    },
    'mm': {
      minute: '2-digit'
    },
    'ss': {
      second: '2-digit'
    }
  };

  transform(value: Date, format: string): string {
    const dateUnits = [];
    const dateItems = format.split(/\, | \- | |:|\-|\./);
    const delimeters = format.split(/[DMYhms]/).filter(Boolean);
    let stringDate = '';

    dateItems.forEach((item) => {
      let unit;

      if (/hh|mm|ss/.test(item)) {
        unit = value.toLocaleTimeString('ru-Ru', this.units[item]);
        if (unit.length === 1) {
          unit = `0${unit}`;
        }
      } else if (item === 'MMMM') {
        const options = Object.assign({ day: 'numeric' }, this.units[item]);
        unit = value.toLocaleDateString('ru-Ru', options).split(' ')[1];
      } else {
        unit = value.toLocaleString('ru-Ru', this.units[item]);
      }

      dateUnits.push(unit);
    });

    dateUnits.forEach((item, i) => {
      stringDate += item + (delimeters[i] ? delimeters[i] : '');
    });

    return stringDate;
  }

  timeLeft(dateOne, dateTwo) {
    const dt1 = new Date(dateOne);
    const dt2 = new Date(dateTwo);
    let str = '';

    const msDiff = dt1.getTime() - dt2.getTime();
    const dirtHours = ((msDiff / 1000) / 60) / 60;
    const hours = Math.floor(dirtHours);
    const minutes = Math.floor((dirtHours - hours) * 60);

    if (hours > 0) {
      str += `${hours} ч. `;
    }

    if (minutes > 0) {
      str += `${minutes} мин`;
    }

    return str;
  }
}
