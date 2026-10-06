# liio — Design System

## Product language

liio uses a playful child-facing visual language without making the Parents Area feel childish. The system uses the same brand, spacing and interaction primitives across both zones.

## Typography

- **Fredoka** — brand, primary headings and high-emphasis controls.
- **Inter** — body copy, form controls, metadata and dense parent information.

## Core tokens

Tokens live in `app/design-tokens.css`.

- Brand: `--purple`, `--purple-deep`, `--purple-soft`
- Text: `--ink`, `--muted`
- Surfaces: `--warm`, `--surface`, `--surface-muted`
- Feedback: `--teal`, `--yellow`, `--blue`, `--coral`
- Space: `--space-1` through `--space-12`
- Radius: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`
- Elevation: `--shadow-soft`, `--shadow-card`, `--shadow-elevated`

## Shared primitives

`app/components/ui.tsx` provides:

- `MobileShell`
- `Brand`
- `BackButton`
- `DetailHeader`
- `EmptyState`

New screens should compose these before creating one-off structures.

## Interaction standards

- Every interactive element must have a visible keyboard focus ring.
- Disabled controls must remain visually identifiable.
- Buttons and links must have a minimum practical touch target around 44px.
- Modal dialogs must have an explicit close action.
- Empty states explain both the current state and the next action.
- Loading states must not fabricate data.

## Responsive behavior

liio remains an app-shaped experience on desktop and tablet. At widths above 768px, the mobile shell is presented as an elevated application frame instead of stretching controls across the viewport.

## Child-facing surfaces

- Purple is the primary action and brand color.
- Illustration and mascot elements may be playful.
- Copy should be short, direct and age-appropriate.
- Homework should show one primary next step at a time.

## Parent-facing surfaces

- Use denser information hierarchy.
- Keep destructive actions visually distinct.
- Show child context before controls that affect a child.
- Activity and limits must reflect persisted data, not demo placeholders.

## Internationalization

Visible strings come from `lib/i18n/catalog.ts`. Do not add page-local translation objects. The four supported languages are PT, EN, ES and DE.
