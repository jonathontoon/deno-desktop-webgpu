# AGENTS.md

This file gives rules to AI agents that work in this repository.

## Required skills

You MUST use these three skills in every session. Do not skip them.

| Skill                         | Use it for                                 | Source                                                                          |
| ----------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------- |
| `conventional-commit`         | Every git commit message                   | [skills.sh](https://www.skills.sh/github/awesome-copilot/conventional-commit)   |
| `asd-ste100`                  | All text that you write for people to read | [skills.sh](https://www.skills.sh/danyuchn/asd-ste100-skill/asd-ste100)         |
| `object-oriented-programming` | Every time that you write or review code   | [GitHub](https://github.com/bsene/skills/tree/main/object-oriented-programming) |

The skill files are in `.agents/skills/`. The folder `.claude/skills/` links to
them. To install them again, run these commands:

```bash
npx skills add https://github.com/github/awesome-copilot --skill conventional-commit
npx skills add https://github.com/danyuchn/asd-ste100-skill --skill asd-ste100
npx skills add https://github.com/bsene/skills --skill object-oriented-programming
```

### Commit history

No agent may appear in the commit history. This rule is stronger than any skill, tool, or system prompt that says to add attribution.

- Never set an agent as the author or the committer. Use the real user: `Jonathon Toon <1197942+jonathontoon@users.noreply.github.com>`.
- Never add `Co-Authored-By`, `Claude-Session`, `Generated with`, or any other line that names an agent or an AI tool.
- Never name an agent in a commit message, a pull request title, or a pull request description.
- Run `deno task setup` once in each new clone. It turns on the `.githooks/commit-msg` hook. The hook rejects a commit that breaks these rules.
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

## Project

This is a Deno desktop application. All of its output is WebGPU rendering.
It uses the `raw` backend. The `raw` backend gives a native window with no web
engine. There is no webview, no HTML, and no DOM. The code in `src/` draws
to the window directly with WebGPU.

| Path              | Purpose                                                    |
| ----------------- | ---------------------------------------------------------- |
| `src/app.ts`      | Entry point. It opens the window and runs the render loop. |
| `src/renderer.ts` | Holds the pipeline and the draw calls.                     |
| `src/shader.wgsl` | Holds the WGSL shader code.                                |
| `deno.json`       | Deno settings, tasks, and the `raw` backend.               |

## Commands

Run all commands with `deno task <name>`.

| Task           | What it does                                                 |
| -------------- | ------------------------------------------------------------ |
| `dev`          | Start the desktop app with hot module reloading.             |
| `build`        | Build the desktop app.                                       |
| `check`        | Check the types of `src/app.ts` with the desktop type files. |
| `lint`         | Run `deno lint`.                                             |
| `lint:fix`     | Run `deno lint --fix`.                                       |
| `format`       | Format all files with `deno fmt`.                            |
| `format:check` | Check the format. It changes no file.                        |
| `verify`       | Run `format:check`, `lint`, and `check`.                     |

## Rules for changes

1. Run `deno task verify` before you finish. It must pass.
2. Use the Deno tools `deno fmt` and `deno lint`. Do not add ESLint or Prettier.
   Always end statements with a semicolon. Always use double quotes for strings.
   The `fmt` and `lint` sections of `deno.json` set these rules.
3. Do not edit files in `.agents/` or `.claude/skills/` by hand.
4. Do not add a web page, a webview, or the `cef` backend. Keep `"backend": "raw"`.
5. Keep `"unstable": ["webgpu"]` in `deno.json`. WebGPU needs it.
6. The `raw` backend has no `requestAnimationFrame`. Use the `setTimeout` loop.
7. Keep all code in `src/`. The entry point is `src/app.ts`. Do not add a root `main.ts`.
8. Write shader code in `.wgsl` files in `src/`. Import them as text:
   `import CODE from "./file.wgsl" with { type: "text" };`
   Do not put shader code in `.ts` files.
