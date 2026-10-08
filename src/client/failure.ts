/**
 * The `showFailure` function.
 *
 * @module
 */

/**
 * Show an error to the user in the page. The error also goes to the console.
 *
 * @param error - The error. It can be any value that was thrown.
 * @param target - The element that shows the message. It is hidden until now.
 *
 * @example
 * ```typescript
 * showFailure(new Error("WebGPU is not available."), element);
 * ```
 */
export function showFailure(error: unknown, target: HTMLElement): void {
  console.error(error);
  target.textContent = error instanceof Error ? error.message : String(error);
  target.hidden = false;
}
