/**
 * The `showAlert` function.
 *
 * @module
 */

/**
 * Show an error to the user. It writes the error to the console and shows its
 * message in an element of the page.
 *
 * @param target - The element that shows the message. The function makes it
 * visible.
 * @param error - The error, or any thrown value.
 *
 * @example
 * ```typescript
 * main().catch((error) => showAlert(element, error));
 * ```
 */
export function showAlert(target: HTMLElement, error: unknown): void {
  console.error(error);
  target.textContent = error instanceof Error ? error.message : String(error);
  target.hidden = false;
}
