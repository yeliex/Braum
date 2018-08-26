import BigInt from 'bignumber.js';
import * as _ from 'lodash';

export namespace Transforms {
  export const to16 = (number: number | string) => {
    return new BigInt(number, 10).toString(16);
  };

  export const from16 = (number: string | Buffer) => {
    if (number instanceof Buffer) {
      return number.toString('10');
    }
    return new BigInt(number, 16).toString(10);
  };

  export function Id(key) {
    return {
      get: function () {
        const value = this.getDataValue(key);
        return value ? to16(value) : value;
      },
      set: function (value) {
        this.setDataValue(key, value.length === 16 ? from16(value) : value);
      },
    };
  }

  export function Enum(key, enums) {
    return {
      get: function () {
        const value = this.getDataValue(key);
        return enums[value];
      },
      set: function (val) {
        if (typeof val === 'string') {
          this.setDataValue(key, enums[val]);
        } else {
          this.setDataValue(key, val);
        }
      },
    };
  }

  export function Bolb(key) {
    return {
      get: function () {
        const value = this.getDataValue(key);
        return JSON.parse(value.toString());
      },
      set: function (val) {
        this.setDataValue(key, JSON.stringify(val));
      },
    };
  }
}

/**
 *
 * @param origin
 * @param keys  keys not split
 */
export const parseQuery = (origin: any, keys: string[] = []): any => {
  return Object.keys(origin).reduce((total, k) => {
    const key = _.camelCase(k);
    const value = origin[k];
    total[key] = keys.includes(key) ? value : (value && value !== '' ? String(value).split(',') : []);
    return total;
  }, {});
};
