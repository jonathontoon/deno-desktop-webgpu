# Deno Desktop WebGPU

A Deno desktop application that draws a 3D cube. It uses the `cef` backend.
This backend puts a Chromium web view in the native window. The page has one
canvas, and the code draws to it.

The program draws with WebGPU. With `deno task dev`, the page also shows a meter
in the upper left corner. It shows the number of animation frames and timer
ticks each second, the number of size reports, the longest waits between two
frames and between two ticks, and the size of the canvas. The page also loads
itself again when you change a file. A built app does not show these things.

The goal is the `raw` backend, which has no web engine. The `raw` backend does
not work on macOS now. See the TODO in `AGENTS.md`.

## Set up

Install [Deno](https://deno.com) 2.9 or later. No other package is needed.
Then run `deno task setup` once. It sets the git user and turns on the commit checks.
Before each commit, the hook runs `deno task verify`. A commit succeeds only when the format, lint, types, JSDoc, and unit tests all pass. GitHub runs the same checks on each push. A commit that names an agent fails the check.

You need a computer with a GPU that supports WebGPU.

## Use

| Command            | What it does                                                    |
| ------------------ | --------------------------------------------------------------- |
| `deno task bundle` | Bundle the page script into `dist/client.js`.                   |
| `deno task dev`    | Start the app with hot reloading. It bundles after each change. |
| `deno task build`  | Bundle, then build the app. The output goes to `dist/`.         |
| `deno task test`   | Run the unit tests.                                             |
| `deno task verify` | Run all checks: format, lint, types, JSDoc, and tests.          |
| `deno task fix`    | Fix the format and the lint problems.                           |
| `deno task lint`   | Run `deno lint`.                                                |
| `deno task format` | Format all files with `deno fmt`.                               |

`deno desktop` is an experimental Deno command. Its options can change.

## Files

| File                       | Purpose                                                        |
| -------------------------- | -------------------------------------------------------------- |
| `src/desktop/app.ts`       | Deno entry point. It opens the window and serves the page.     |
| `src/desktop/server/`      | Runs in the Deno process. It serves the page and, in           |
|                            | development mode, reads the page files from the disk.          |
| `src/desktop/dev/`         | Runs `deno task dev`: it bundles, and it starts the app.       |
| `src/desktop/constants.ts` | The fixed values of the Deno side.                             |
| `src/desktop/types.ts`     | The types and protocols of the Deno side.                      |
| `src/constants.ts`         | The fixed values that both sides use.                          |
| `src/client/`              | Runs in the page. It has the entry point `main.ts`, the page   |
|                            | files `index.html` and `styles.css`, `canvas.ts` (`Canvas`),   |
|                            | `alert.ts` (`showAlert`), and                                  |
|                            | the files and folders below:                                   |
| `src/client/development/`  | `Meter` and `reloadOnChange`. `main.ts` uses them only in      |
|                            | development mode.                                              |
| `src/client/constants.ts`  | The fixed values of the page.                                  |
| `src/client/types.ts`      | The types and protocols of the page.                           |
| `src/client/singleton.ts`  | The `Singleton` holder for classes that own a unique resource. |
| `src/client/gpu/`          | The WebGPU code: `Graphics`, `Renderer`, and `Pipeline`.       |
| `src/client/scene/`        | `Scene`, `createCube`, and the cube shader.                    |
| `src/testing/`             | Fake GPU and canvas objects for the unit tests.                |
| `src/**/*.test.ts`         | The unit tests.                                                |
| `deno.json`                | Settings. It selects the `cef` backend.                        |

## Agents

Read `AGENTS.md` before you change this repository.
