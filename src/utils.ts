import type { SakanaWidgetOptions } from './types';

/**
 * throttle a func with requestAnimationFrame,
 * https://github.com/wuct/raf-throttle/blob/master/rafThrottle.js
 */
export function throttle<T extends (...args: any[]) => any>(callback: T): T {
  let requestId: number | null = null;
  let lastArgs: any[];
  const later = (context: any) => () => {
    requestId = null;
    callback.apply(context, lastArgs);
  };
  const throttled = function (...args: any[]) {
    lastArgs = args;
    if (requestId === null) {
      // @ts-expect-error this refers to context inherited from outside
      requestId = requestAnimationFrame(later(this));
    }
  } as T;
  return throttled;
}

/**
 * get the canvas context with device pixel ratio
 */
export function getCanvasCtx(
  canvas: HTMLCanvasElement,
  appSize: number,
  devicePixelRatio = (window.devicePixelRatio || 1) * 2
) {
  const canvasRenderSize = appSize * devicePixelRatio;
  canvas.width = canvasRenderSize;
  canvas.height = canvasRenderSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }
  // scale all drawing operations by the dpr
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(devicePixelRatio, devicePixelRatio);
  return ctx;
}

export function getDefaultOptions(): Omit<SakanaWidgetOptions, 'registry'> {
  return {
    size: 200,
    autoFit: false,
    controls: true,
    rod: true,
    draggable: true,
    stroke: {
      color: '#b4b4b4',
      width: 10,
    },
    threshold: 0.1,
    rotate: 0,
    title: false,
  };
}

export function getDefaultCharacterConfiguration(
  variant: 'chisato' | 'takina'
) {
  if (variant === 'chisato') {
    return {
      props: {
        i: 0.08,
        s: 0.1,
        d: 0.99,
      },
      initialState: {
        r: 1,
        y: 40,
        t: 0,
        w: 0,
      },
    };
  } else {
    return {
      props: {
        i: 0.08,
        s: 0.1,
        d: 0.988,
      },
      initialState: {
        r: 12,
        y: 2,
        t: 0,
        w: 0,
      },
    };
  }
}
