# Deno Desktop WebGPU

A Deno desktop application that draws with WebGPU. It uses the `raw` backend.
This backend gives a native window with no web engine. The code draws to the
window directly.

## Set up

Install [Deno](https://deno.com) 2.9 or later. No other package is needed.
Then run `deno task setup` once. It turns on the commit message check.

You need a computer with a GPU that supports WebGPU.

## Use

| Command            | What it does                               |
| ------------------ | ------------------------------------------ |
| `deno task dev`    | Start the app with hot reloading.          |
| `deno task build`  | Build the app. The output goes to `dist/`. |
| `deno task verify` | Check format, lint, and types.             |
| `deno task lint`   | Run `deno lint`.                           |
| `deno task format` | Format all files with `deno fmt`.          |

`deno desktop` is an experimental Deno command. Its options can change.

## Files

| File              | Purpose                                                    |
| ----------------- | ---------------------------------------------------------- |
| `src/app.ts`      | Entry point. It opens the window and runs the render loop. |
| `src/renderer.ts` | Holds the pipeline and the draw calls.                     |
| `src/shader.wgsl` | Holds the WGSL shader code.                                |
| `deno.json`       | Settings. It selects the `raw` backend.                    |

## Agents

Read `AGENTS.md` before you change this repository.
