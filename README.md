# Deno Desktop WebGPU

A Deno desktop application that draws with WebGPU. It uses the `raw` backend.
This backend gives a native window with no web engine. The code draws to the
window directly.

## Set up

Install [Deno](https://deno.com) 2.9 or later. No other package is needed.
Then run `deno task setup` once. It sets the git user and turns on the commit checks.
Before each commit, the hook runs `deno task verify`. A commit succeeds only when the format, lint, types, JSDoc, and unit tests all pass. GitHub runs the same checks on each push. A commit that names an agent fails the check.

You need a computer with a GPU that supports WebGPU.

## Use

| Command            | What it does                                           |
| ------------------ | ------------------------------------------------------ |
| `deno task dev`    | Start the app with hot reloading.                      |
| `deno task build`  | Build the app. The output goes to `dist/`.             |
| `deno task test`   | Run the unit tests.                                    |
| `deno task verify` | Run all checks: format, lint, types, JSDoc, and tests. |
| `deno task fix`    | Fix the format and the lint problems.                  |
| `deno task lint`   | Run `deno lint`.                                       |
| `deno task format` | Format all files with `deno fmt`.                      |

`deno desktop` is an experimental Deno command. Its options can change.

## Files

| File               | Purpose                                                      |
| ------------------ | ------------------------------------------------------------ |
| `src/app.ts`       | Entry point. It calls `Application.launch()`.                |
| `src/constants.ts` | Holds all fixed values.                                      |
| `src/types.ts`     | Holds all shared types and protocols.                        |
| `src/core/`        | `Application`, `AppWindow`, and `RenderLoop`.                |
| `src/gpu/`         | `GPUContext` and `Renderer`. They use the GPU.               |
| `src/scene/`       | `Scene`, the drawable classes, and the `.wgsl` shader files. |
| `src/testing/`     | Fake GPU and window objects for the unit tests.              |
| `src/**/*.test.ts` | The unit tests.                                              |
| `deno.json`        | Settings. It selects the `raw` backend.                      |

## Agents

Read `AGENTS.md` before you change this repository.
