# Deno Desktop WebGPU

A Deno desktop application that draws a 3D cube. It uses the `webview` backend.
This backend puts the web view of the operating system in the native window. The
page has one canvas, and the code draws to it. The oldest supported macOS is
macOS 14.

The goal is the `raw` backend, which has no web engine. The `raw` backend does
not work on macOS now. See the TODO in `AGENTS.md`.

## Set up

Install [Deno](https://deno.com) 2.9 or later. No other package is needed.
Then run `deno task setup` once. It sets the git user and turns on the commit checks.
Before each commit, the hook runs `deno task verify`. A commit succeeds only when the format, lint, types, JSDoc, and unit tests all pass. GitHub runs the same checks on each push. A commit that names an agent fails the check.

You need a computer with a GPU that supports WebGPU.

## Use

| Command            | What it does                                            |
| ------------------ | ------------------------------------------------------- |
| `deno task bundle` | Bundle the page script into `dist/client.js`.           |
| `deno task dev`    | Bundle, then start the app with hot reloading.          |
| `deno task build`  | Bundle, then build the app. The output goes to `dist/`. |
| `deno task test`   | Run the unit tests.                                     |
| `deno task verify` | Run all checks: format, lint, types, JSDoc, and tests.  |
| `deno task fix`    | Fix the format and the lint problems.                   |
| `deno task lint`   | Run `deno lint`.                                        |
| `deno task format` | Format all files with `deno fmt`.                       |

`deno desktop` is an experimental Deno command. Its options can change.

## Files

| File                | Purpose                                                           |
| ------------------- | ----------------------------------------------------------------- |
| `src/app.ts`        | Deno entry point. It opens the window and serves the page.        |
| `src/server/`       | Runs in the Deno process. It serves the page.                     |
| `src/constants.ts`  | Holds all fixed values.                                           |
| `src/types.ts`      | Holds all shared types and protocols.                             |
| `src/singleton.ts`  | The `Singleton` holder for classes that have one instance.        |
| `src/client/`       | Runs in the page. It has the entry point `main.ts`, the page      |
|                     | files `index.html` and `styles.css`, and these folders:           |
| `src/client/core/`  | `Application`, `Canvas`, and `Alert`.                             |
| `src/client/gpu/`   | `Graphics` and `Renderer`. They use the GPU.                      |
| `src/client/scene/` | `Scene`, `Pipeline`, `Triangle`, `Cube`, and the `.wgsl` shaders. |
| `src/testing/`      | Fake GPU and canvas objects for the unit tests.                   |
| `src/**/*.test.ts`  | The unit tests.                                                   |
| `deno.json`         | Settings. It selects the `webview` backend.                       |

## Agents

Read `AGENTS.md` before you change this repository.
