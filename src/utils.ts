/* eslint-disable @typescript-eslint/no-explicit-any */

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
  ctx.scale(devicePixelRatio, devicePixelRatio);
  return ctx;
}
