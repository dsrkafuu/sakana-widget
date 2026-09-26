## v4.0.0

- feat: support `imageFit: 'contain'` for non-square character images (issue #21)
- feat: add instance-level icon-only custom control bar buttons (issue #13)
- feat: provide a character-free ESM core and individual character imports for smaller consumer bundles (PR #22)
- fix: use a stable filename for the shared ESM character type declaration
- refactor: replace the Canvas rod with a styled DOM element
- fix: keep one animation frame per widget and use elapsed frame time for motion
- fix: redraw and resume motion after state or character changes
- fix: use viewport coordinates for mouse and touch dragging
- fix: stop animation at the configured rotation equilibrium
- fix: reset the auto-mode indicator when hiding or unmounting
- fix: preserve the mount element, its children, and its listeners; measure auto-fit size after mounting
- feat: use accessible native buttons for widget controls
- test: add interaction regression tests and run them in CI

## v3.1.0

- feat: define compatibility-preserving package exports
- chore: update CDN examples for the 3.1.0 release

## v3.0.2

- chore: update build and development dependencies
- chore: replace `npm-run-all` with Bun-native script orchestration
- chore: validate lockfile, lint, and types in CI
- build: rebuild package artifacts automatically before packing

## v3.0.1

- fix: avoid duplicate initial state listener notifications when restoring persisted hide state
- fix: ignore localStorage failures in restricted browsing contexts
- chore: add missing dev server dependency

## v3.0.0

- feat: add persisit state mode
- chore: some memory fix & stability improvement
- build: umd build now includes css styles (inlined in js)
- build: migrate to tsdown and becomes pure es module (supports es2021+)

## v2.7.1

- chore: common deps update

## v2.7.0

- feat: make accessibility improvement optional

## v2.6.1

- feat: improve accessibility

## v2.6.0

- feat: add `rod` and `draggable` options

## v2.5.0

- fix: getCharacter before initCharacter

## v2.4.2

- fix: scss build issue

## v2.4.1

- chore: update deps

## v2.4.0

- feat: optimize ssr usage
- build: move to rollup

## v2.3.2

- fix: source map

## v2.3.1

- fix: mount to dom element

## v2.3.0

- feat: optimize canvas render size
- fix: package export declaration
- chore: bind this with arrow func
- chore: ts private check

## v2.2.2

- fix: side effect of `getCharacter(s)`

## v2.2.1

- fix: readme npm import example

## v2.2.0

- feat: auto resizing support
- feat: configurable cut threshold
- feat: configurable rotate origin
- fix: limit inertia & rotate deg
- fix: frame diff ignore threshold

## v2.1.1

- fix readme image
- optimize package size

## v2.1.0

- fix control bar issues
- add next char func

## v2.0.1

- fix css z-index issue

## v2.0.0

- refactor code and update init api
- fix render issue under high refresh rate

## v1.2.0

- able to hide control bar

## v1.1.2

- fix image switch issue

## v1.1.1

- fix css position when not mounted on a bfc element
- sync upstream dbf7c6d

## v1.1.0

- rename some constructor prop names
- optimize canvas rendering quality
- organize the code structure
