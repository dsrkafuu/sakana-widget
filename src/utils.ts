/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * simple clone deep polyfill
 */
function cloneDeepPolyfill<T>(src: T): T {
  const map = new Map();
  function _cloneDeep<T>(src: T): T {
    if (src && typeof src === 'object') {
      if (map.has(src)) {
        return map.get(src);
      }
      const ret = (Array.isArray(src) ? [] : {}) as T;
      map.set(src, ret);
      for (const key of Object.keys(src) as Array<keyof T>) {
        ret[key] = _cloneDeep(src[key]);
      }
      return ret;
    } else {
      return src;
    }
  }
  const ret = _cloneDeep(src);
  map.clear();
  return ret;
}

/**
 * browser native deep clone
 */
export function cloneDeep<T>(src: T): T {
  if (typeof window.structuredClone === 'function') {
    // https://developer.mozilla.org/en-US/docs/Web/API/structuredClone
    return window.structuredClone(src);
  } else {
    return cloneDeepPolyfill(src);
  }
}
