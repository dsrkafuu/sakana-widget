# AGENTS.md

## Setup

- **Runtime & package manager**: Bun 1.4.2 (lockfile is `bun.lock`). Use `bun install --frozen-lockfile` for reproducible installs.

## Commands

| Task                | Command             |
| ------------------- | ------------------- |
| Format              | `bun run fmt`       |
| Lint                | `bun run lint`      |
| Test                | `bun run test`      |
| Build (all)         | `bun run build`     |
| Build lib only      | `bun run build:lib` |
| Dev (watch + serve) | `bun run dev`       |

## Build order

`build` runs sequentially: `build:lib` → `build:umd` → `build:docs`. Do not skip steps.

- `build:lib` (tsdown) outputs ESM + UMD + CSS to `lib/`
- `build:umd` reads `lib/index.min.css` + `lib/index.umd.js` and produces `lib/index.umd.min.js` (all-in-one JS with inline CSS)
- `build:docs` copies the UMD bundle into `docs/` and minifies the demo HTML

## Architecture

- **Single package**, no monorepo. Source in `src/`, output in `lib/` (gitignored).
- **Entries**: `src/index.ts` registers both built-in characters for the default/UMD bundle; `src/core.ts` exports the character-free ESM class. `src/characters/chisato.ts` and `takina.ts` are individual ESM character entries.
- **Types**: `src/characters/index.ts` defines `SakanaWidgetState` and `SakanaWidgetCharacter`.
- **Styles**: `src/index.scss` (SCSS, compiled by tsdown). All CSS uses `.sakana-widget-*` prefix.
- **Static assets**: `.png` → base64 dataurl, `.svg` → inline text string (configured in `tsdown.config.ts`).
- CSS is injected into the ESM bundle (`inject: true`), so consumers do not need to import CSS separately.

## Key conventions

- **ESM only** (`"type": "module"`, `verbatimModuleSyntax: true`). No CJS.
- **Lint**: oxlint with plugins: oxc, node, eslint, import, promise, unicorn, typescript.
- **Format**: oxfmt (single quotes, sort imports, ignore `*.svg`).
- **EditorConfig**: 2-space indent, LF line endings.

## CI

- GitHub Actions `.github/workflows/gh-pages.yml` builds docs on push to `main` and deploys to GitHub Pages via `peaceiris/actions-gh-pages`.
- Uses Bun via `oven-sh/setup-bun` and installs from `bun.lock` with `--frozen-lockfile`.

## Testing

`bun run test` rebuilds the library and runs the interaction regression tests with Bun and happy-dom.
