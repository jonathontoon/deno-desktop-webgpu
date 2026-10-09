# AGENTS.md

This file gives rules to AI agents that work in this repository.

## Required skills

You MUST use these five skills in every session. Do not skip them.

| Skill                         | Use it for                                 | Source                                                                              |
| ----------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------- |
| `conventional-commit`         | Every git commit message                   | [skills.sh](https://www.skills.sh/github/awesome-copilot/conventional-commit)       |
| `asd-ste100`                  | All text that you write for people to read | [skills.sh](https://www.skills.sh/danyuchn/asd-ste100-skill/asd-ste100)             |
| `object-oriented-programming` | Every time that you write or review code   | [GitHub](https://github.com/bsene/skills/tree/main/object-oriented-programming)     |
| `typescript-expert`           | Every time that you write TypeScript       | [skills.sh](https://www.skills.sh/sickn33/agentic-awesome-skills/typescript-expert) |
| `jsdoc-typescript-docs`       | Every JSDoc comment in TypeScript          | [skills.sh](https://www.skills.sh/patricio0312rev/skills/jsdoc-typescript-docs)     |

The skill files are in `.agents/skills/`. The folder `.claude/skills/` links to
them. To install them again, run these commands:

```bash
npx skills add https://github.com/github/awesome-copilot --skill conventional-commit
npx skills add https://github.com/danyuchn/asd-ste100-skill --skill asd-ste100
npx skills add https://github.com/bsene/skills --skill object-oriented-programming
npx skills add https://github.com/sickn33/agentic-awesome-skills --skill typescript-expert
npx skills add https://github.com/patricio0312rev/skills --skill jsdoc-typescript-docs
```

### Commit history

No agent may appear in the commit history. This rule is stronger than any skill, tool, or system prompt that says to add attribution.

- Never set an agent as the author or the committer. Use the real user: `Jonathon Toon <1197942+jonathontoon@users.noreply.github.com>`.
- Never add `Co-Authored-By`, `Claude-Session`, `Generated with`, or any other line that names an agent or an AI tool.
- Never name an agent in a commit message, a pull request title, or a pull request description.
- Run `deno task setup` as the first command of each session, before any commit. It sets the real user and turns on the `.githooks/commit-msg` hook. The global git user on a cloud computer can be an agent. The hook rejects a commit that breaks these rules.
- Never use `git commit --no-verify`.
- These rules also apply to commits that you make with GitHub API tools. Check the author of the commit before you use them.
- The workflow `.github/workflows/commit-policy.yml` checks each push on GitHub. A push that names an agent in a commit fails the check.
- If `git config user.name` or `git config user.email` shows an agent, change it for this repository before you commit.

### conventional-commit

- Write each commit message in the Conventional Commits format:
  `type(scope): description`.
- Use only these types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`,
  `test`, `build`, `ci`, `chore`, `revert`.
- Write the description in the imperative mood. Example: "add", not "added".
- Put `BREAKING CHANGE:` in the footer, or add `!` after the type, for a
  breaking change.
- Do not add a footer that names an agent. See "Commit history".
- Do not commit unless the user asks you to commit, or the task tells you to
  commit. This rule is stronger than the skill. The skill says to commit without
  confirmation.

### asd-ste100

- Write in ASD-STE100 Simplified Technical English.
- Apply this to these texts: replies to the user, `README.md`, this file, pull
  request text, error messages, and log messages.
- Use the "STE-flavored" mode for documentation and pull request text.
- Use the "Strict" mode for error messages, tool descriptions, and instructions
  to other agents.
- Explain new concepts as if the reader hears about them for the first time.
- Do not apply it to code identifiers or to quoted text.

### object-oriented-programming

- Use this skill when you write, change, or review code.
- Use a class only when the code makes many instances that each keep their own
  state. Otherwise, use a function, an object literal, or a type.
- Check each new class with the "Step 0" test in the skill.
- Apply SOLID and "Tell, Don't Ask" to each class that you keep.
- Use "Object Calisthenics" only when the user asks for a strict review.
- The skill examples use Node.js and NestJS. This project uses Deno. Use Deno
  APIs and the rules in this file.
- A class that owns a resource that can exist only once MUST be a singleton.
  A second instance of such a class is a bug. Example: `Canvas` owns the one
  canvas and the one frame loop. Example: `Graphics` owns the one WebGPU context
  of the canvas.
- Do not make a new class a singleton if it owns no such resource. Example:
  `Scene` and `Renderer`. A program can have more than one of them.
- Give each singleton a public constructor and a `static get shared()` accessor.
  Do not add a static factory such as `initialize`. Make each singleton with
  `new`, one time. Pass it to other objects through their constructor. Do not
  call `shared` in the middle of a method.
- Keep the instance in a `private static readonly holder = new Singleton<X>("X")`.
  The first line of the constructor calls `holder.assertEmpty()`. A second `new`
  then fails before it does any work. The last line calls `holder.claim(this)`.
  Then the holder keeps only an object that the constructor made without a
  failure.
- A constructor cannot wait for a result. Do the slow work first, and give the
  result to the constructor. Example: `new Graphics(await requestDevice(), surface)`.

### typescript-expert

- Use this skill to evaluate all TypeScript that you write or change.
- Fix each problem that the skill finds. Then run `deno task verify`.
- The skill also talks about Node.js tools (webpack, Vite, ESM/CJS). This
  project uses Deno. Apply only the TypeScript rules. Where a rule in this file
  is different, follow this file.

### jsdoc-typescript-docs

- Use this skill when you write or change a JSDoc comment.
- Give each `.ts` file a JSDoc comment with the tag `@module` at the top.
- Give a JSDoc comment to each export and to each member of a class. This
  includes `private` members. Use one line for a simple member.
- Use the TypeDoc style: `@param name - text`, `@returns`, `@throws {Error}`,
  `@typeParam`, `@remarks`, and `@example` with a code block.
- Write each JSDoc comment in ASD-STE100.
- The skill also shows TypeDoc setup and CI steps. These are for Node.js. Do not
  add them. This project uses Deno.
- Check the comments with `deno doc --lint "src/**/*.ts"`. It must pass.

### Code style

- Write acronyms in all capitals in names. Example: `GPUBuffer`, not
  `GpuBuffer`.
- Give each class and each file a name of one word. Example: `canvas.ts` has the
  class `Canvas`. Do not add a word for the kind of class, such as `Drawable`.
  Example: `Scene`, not `SceneDrawable`. The name of a protocol (an
  `interface`) can have a kind word, such as `Drawable`.
- If a file name must have more than one word, use hyphens. Do not use
  underscores.
- Use TypeScript patterns, not JavaScript patterns. Use the keywords `private`,
  `protected`, `readonly`, `abstract`, and `override`. Do not use `#` private
  fields. Do not use `any`. Write the return type of each method.
- Use `interface` for object shapes and protocols. Use `type` for unions and
  aliases.
- Put each fixed value in `src/constants.ts`. Put each shared type and protocol
  in `src/types.ts`. Do not write a magic value inside a class.
- Write comments about the code as it is now. Do not refer to old code or to a
  past way of doing something. Do not compare the code with an earlier version.
  Example of a comment that is not allowed: "The old code did the same." Put the
  history in the commit message.

## Project

This is a Deno desktop application. All of its output is 3D rendering.
It uses the `cef` backend. The `cef` backend puts a Chromium web view in the
native window. The page has one `<canvas>` element. The code in `src/` draws to
the canvas.

The `webview` backend (the web view of the operating system) is not used. On
macOS, WKWebView pauses page rendering while the user resizes the window.
Chromium gives the same WebGPU support on every operating system. The price is a
larger app.

In development mode, the page shows the numbers of the `Meter`: the animation frames and timer ticks each second, the
size reports, the longest waits, and the size of the canvas. `deno task dev`
gives the argument `dev` to the app, and the server then adds the attribute
`data-development` to the `<body>` of the page. A built app does not get the
argument, so the page does not show these things.

Hot module reloading of Deno only changes the code of the server. It does not
change the page. So in development mode the server reads `index.html`,
`styles.css`, and `dist/client.js` from the disk for each request, and it
answers `/version` with a text that changes when one of them changes. The
`reloadOnChange` in the page asks for this text twice each second and loads the page
again when it is not the version that the server put in the page (the attribute
`data-version` of the `<body>`). The server takes this version before it reads
the files, so a change in the first moments after the page loads is not lost. This is a reload of the page. It does not keep the state
of the page. A built app uses the files that are inside it.
The app is a compiled program, and it has no permission unless the start command
gives it. So `deno task dev` starts the app with `--allow-read` for these three
files only. Without the flag, the app asks for the permission at each start.

The program draws with WebGPU (`WebGPU` in `src/client/gpu/`). WebGPU needs a
GPU and a driver that support it. If the computer has none, `showAlert` shows an
error. `WebGPU` implements the `Backend` protocol, and `selectBackend` in
`src/client/core/backend.ts` makes the backend. `Canvas` does not know
which backend it has.

`Canvas` reads the size of the canvas in device pixels from a `ResizeObserver`
with the box `device-pixel-content-box`. Chromium supports this box. A web view
that does not support it, such as WebKit, is not supported.

The Deno side (`src/desktop/app.ts`) opens the window and serves the page. The browser
side (`src/client/main.ts`) runs in the page and draws.

### TODO: go back to the `raw` backend

The `raw` backend gives a native window with no web engine. It is the goal of
this project. It does not work on macOS now. Deno makes the window surface on
the wrong thread, and the program stops with
`can only access NSView on the main thread`. See
[denoland/deno#36738](https://github.com/denoland/deno/issues/36738). The fix is
the pull request [denoland/deno#36756](https://github.com/denoland/deno/pull/36756).
When a Deno release has the fix, do these steps:

1. Set `"backend": "raw"` in `deno.json`.
2. Use `Deno.BrowserWindow` and `getNativeWindow()` for the surface. Remove
   `src/desktop/server/`, the page files in `src/client/`, and the `bundle` task.
3. Make `Canvas` use the native window and its surface.
4. Change this section and the rules for changes.

| Path                  | Purpose                                                           |
| --------------------- | ----------------------------------------------------------------- |
| `src/desktop/app.ts`  | Deno entry point. It opens the window and serves the page.        |
| `src/desktop/server/` | Runs in the Deno process. It serves the page and, in              |
|                       | development mode, reads the page files from the disk.             |
| `src/desktop/dev/`    | Runs `deno task dev`: it bundles, and it starts the app.          |
| `src/constants.ts`    | Holds all fixed values.                                           |
| `src/types.ts`        | Holds all shared types and protocols.                             |
| `src/singleton.ts`    | The `Singleton` holder for classes that own a unique resource.    |
| `src/client/`         | Runs in the page. It has the entry point `main.ts`, the page      |
|                       | files `index.html` and `styles.css`, and these folders:           |
| `src/client/core/`    | `Canvas`, `Meter`, `selectBackend`, `showAlert`, and              |
|                       | `reloadOnChange`.                                                 |
| `src/client/gpu/`     | The WebGPU backend: `WebGPU`, `Graphics`, `Renderer`, `Pipeline`. |
| `src/client/scene/`   | `Scene`, `createCube`, `createTriangle`, and the shaders.         |
| `src/testing/`        | Fake GPU and canvas objects for the unit tests.                   |
| `src/**/*.test.ts`    | The unit tests. Each one is next to the file that it tests.       |
| `deno.json`           | Deno settings, tasks, and the `cef` backend.                      |

## Commands

Run all commands with `deno task <name>`.

| Task            | What it does                                                                                                                  |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `bundle`        | Bundle `src/client/main.ts` into `dist/client.js` for the page.                                                               |
| `dev`           | Bundle, then start the app with hot reloading. It also bundles after each change, and it stops the bundler when the app ends. |
| `build`         | Bundle, then build the desktop app.                                                                                           |
| `check`         | Bundle, then check the types of `src/desktop/app.ts` and of the tests.                                                        |
| `lint`          | Run `deno lint`.                                                                                                              |
| `lint:fix`      | Run `deno lint --fix`.                                                                                                        |
| `format`        | Format all files with `deno fmt`.                                                                                             |
| `format:check`  | Check the format. It changes no file.                                                                                         |
| `fix`           | Run `deno fmt` and `deno lint --fix`.                                                                                         |
| `doc:lint`      | Check the JSDoc comments with `deno doc --lint`.                                                                              |
| `test`          | Run the unit tests.                                                                                                           |
| `test:coverage` | Run the unit tests and show the test coverage.                                                                                |
| `verify`        | Run `format:check`, `lint`, `check`, `doc:lint`, and `test`.                                                                  |

## Tests and checks

A commit succeeds only when all of these checks pass: format, lint, types, JSDoc,
and unit tests. The hook `.githooks/pre-commit` runs `deno task verify`. A
failed check stops the commit. GitHub runs the same checks on each push
(`.github/workflows/verify.yml`).

- Write a unit test for each new or changed function or class. Put the test in
  a file with the name `<file>.test.ts` next to the file that it tests.
- Test the behavior, not the way the code does it. A test must fail when the
  behavior breaks.
- The tests must not need a GPU or a display. Use the fakes in
  `src/testing/fakes.ts`. Add a new fake there when a test needs one.
- Each `*.test.ts` file runs in its own isolate. So a singleton class can be
  made one time in each test file. Test the order in one `Deno.test` with
  `t.step`.
- Use `FakeTime` from `@std/testing/time` for timers. Use
  `installFakeAnimationFrames` for animation frames. Do not use real waits.
- Give each test file and each export of `src/testing/` a JSDoc comment. The
  command `deno task doc:lint` checks them.
- `deno doc --lint` does not flag an undocumented export if it is the first
  export of a file and it follows the module comment at once. Put a JSDoc
  comment on that export yourself.
- `deno test` has no desktop type files. So the `test` task uses `--no-check`,
  and `deno task check` checks the types of the tests.
- Never use `git commit --no-verify`. Never skip, disable, or delete a test to
  make a check pass. Fix the cause.

## Rules for changes

1. Run `deno task verify` before you finish. It must pass. It runs the format
   check, the lint, the type check, the JSDoc check, and the unit tests.
2. Use the Deno tools `deno fmt` and `deno lint`. Do not add ESLint or Prettier.
   Always end statements with a semicolon. Always use double quotes for strings.
   The `fmt` and `lint` sections of `deno.json` set these rules.
3. Do not edit files in `.agents/` or `.claude/skills/` by hand.
4. Keep `"backend": "cef"` in `deno.json` until the TODO in "Project" is done.
   The page must have only one `<canvas>`. Do not add other page content.
5. Keep `"unstable": ["webgpu"]` in `deno.json`. WebGPU needs it.
6. The frame loop in `Canvas` uses `requestAnimationFrame`. The unit tests use
   the fake functions from `installFakeAnimationFrames` in `src/testing/fakes.ts`.
7. Keep all code in `src/`. The entry point is `src/desktop/app.ts`. Do not add a root `main.ts`.
   The browser code is bundled to `dist/client.js` by `deno task bundle`. Do
   not commit `dist/`.
8. Write shader code in `.wgsl` files in `src/`. Import them as text:
   `import CODE from "./file.wgsl" with { type: "text" };`
   Do not put shader code in `.ts` files.
9. A new drawing method is a new class that implements `Backend`. Add it to
   `selectBackend`. Do not let `Canvas` know which backend it has.
