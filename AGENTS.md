# AGENTS.md

## Setup

- **Runtime & package manager**: Bun (lockfile is `bun.lock`). Use `bun install`, not npm/yarn.

## Commands

| Task                | Command             |
| ------------------- | ------------------- |
| Format              | `bun run fmt`       |
| Lint                | `bun run lint`      |
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
- **Entry**: `src/index.ts` → exports default class `SakanaWidget`.
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

- GitHub Actions `.github/workflows/docs.yml` builds docs on push to `main` and deploys to GitHub Pages via `peaceiris/actions-gh-pages`.
- Uses Bun 1.2.14.

## Testing

There are no tests.
