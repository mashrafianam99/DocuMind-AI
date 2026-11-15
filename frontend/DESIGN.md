# DocuMind — Design System

The visual and interaction language of the DocuMind frontend. Read this before
changing UI so new work stays consistent with what exists.

- **Source of truth for tokens:** `src/app/globals.css`
- **Fonts:** `src/app/layout.tsx`
- **Components:** `src/components/`

---

## 1. Concept: the reading room

DocuMind should feel like a quiet desk with a good document on it, not a
neon AI dashboard. The look is warm paper, dark ink, a serif for reading, and
a highlighter for evidence.

| Principle | What it means in practice |
| --- | --- |
| **Evidence first** | Every answer shows where it came from. Citations are visible, clickable, and lead to the exact passage and page. |
| **Reading, not chatting** | Answers are set in a serif at a comfortable size and line height. They read like prose, not chat bubbles. |
| **Quiet chrome** | Interface text uses a neutral sans in muted ink. Borders are hairlines. Only one accent colour is used, and sparingly. |
| **The highlighter means "this is the source"** | Yellow is used only for cited and active evidence (and the one hero word). Don't use it for decoration. |
| **Honest states** | Loading, empty and error states say plainly what is happening and what to do next. |

---

## 2. Colour

All colours are CSS custom properties on `:root`, exposed to Tailwind via
`@theme inline` (for example `bg-paper`, `text-ink-muted`, `border-line`).
**Never hard-code hex values in components.** Use the token utilities so that
dark mode works automatically.

### Tokens

| Token | Tailwind | Light | Dark | Use |
| --- | --- | --- | --- | --- |
| `--paper` | `paper` | `#f5f2ea` | `#151412` | App background |
| `--paper-raised` | `paper-raised` | `#fbf9f4` | `#1d1b18` | Cards, composer, sidebars |
| `--paper-sunken` | `paper-sunken` | `#ece7dc` | `#100f0d` | Hover fills, inline code, quiet panels |
| `--ink` | `ink` | `#1d1b17` | `#ece7dc` | Primary text, primary button fill, user bubble |
| `--ink-soft` | `ink-soft` | `#4a463e` | `#c4bdaf` | Body/answer text |
| `--ink-muted` | `ink-muted` | `#7c766a` | `#8c8577` | Secondary text, labels, placeholders, icons |
| `--line` | `line` | `#e0d9ca` | `#2c2924` | Hairline borders, dividers |
| `--line-strong` | `line-strong` | `#cfc6b3` | `#3b372f` | Input borders, dashed drop zone |
| `--accent` | `accent` | `#b5441b` | `#e0703f` | The one call to action, send button, eyebrow labels, progress |
| `--accent-ink` | `accent-ink` | `#fffaf3` | `#1a0f08` | Text on accent |
| `--accent-soft` | `accent-soft` | `#f3e1d6` | `#3a2117` | Icon discs, drag-over tint |
| `--highlight` | `highlight` | `#f6e48c` | `#6b5c1c` | Highlighter: active citation ring, marker stroke, text selection |
| `--highlight-soft` | `highlight-soft` | `#fbf1c4` | `#2f2a15` | Citation chip fill, active evidence card |
| `--success` | `success` | `#2f7a4f` | `#6cc48f` | "Indexed and ready" |
| `--danger` | `danger` | `#b3261e` | `#f08a80` | Error text and icon |
| `--danger-soft` | `danger-soft` | `#f8e3e0` | `#3a1b18` | Error banner background |

### Rules

- **One accent per view.** There should be one primary accent action on screen
  at a time (for example "Choose a file" or Send). The secondary primary action
  (e.g. "New document") uses `bg-ink text-paper`.
- **The highlighter is semantic.** Yellow means "cited evidence". The single
  exception is the `.marker` stroke on the hero headline.
- **Opacity modifiers are allowed** on tokens (`bg-paper-raised/60`,
  `bg-ink/30` for backdrops) but not as a substitute for a missing token.

### Theming

- The default follows `prefers-color-scheme`.
- `ThemeToggle` writes `data-theme="light" | "dark"` on `<html>` and stores the
  choice in `localStorage` (`documind-theme`), wrapped in try/catch.
- Dark values are defined twice in `globals.css`: under the media query
  (guarded by `:root:not([data-theme="light"])`) and under
  `:root[data-theme="dark"]`. **When you change a dark value, change both.**

---

## 3. Typography

| Role | Family | Tailwind | Notes |
| --- | --- | --- | --- |
| Interface | Geist | `font-sans` (default) | Buttons, labels, chrome, user messages |
| Reading | Newsreader (normal + italic) | `font-serif` | Answers, evidence passages, headings, brand wordmark |
| Data | Geist Mono | `font-mono` | Page numbers, counts, file sizes, percentages, key hints |

Fonts load through `next/font/google` in `layout.tsx` as CSS variables
(`--font-geist-sans`, `--font-newsreader`, `--font-geist-mono`).

### Scale in use

| Element | Style |
| --- | --- |
| Hero headline | `font-serif text-[2.6rem] sm:text-6xl leading-[1.05] tracking-tight text-balance` |
| Panel title ("Evidence") | `font-serif text-xl` |
| Document title bar | `font-serif text-lg` |
| Brand wordmark | `font-serif text-[1.35rem] font-medium tracking-tight` |
| Assistant answer | `font-serif text-[17px] leading-[1.7] text-ink-soft` |
| Evidence passage | `font-serif text-[14.5px] leading-6 text-ink-soft` |
| User message / input | `text-[15px] leading-6` |
| Body / helper | `text-sm` or `text-[13px] text-ink-muted` |
| Eyebrow / section label | `text-[11px] font-medium uppercase tracking-[0.14em–0.18em]` |
| Micro data | `font-mono text-[11px] tabular-nums` |

### Rules

- Use `tabular-nums` on every number that sits next to another number
  (stats, percentages, citation chips).
- Italic serif is reserved for voice: the intro message, the hero's
  highlighted word, step numerals and the sidebar pull quote.
- Bold within answers is `font-semibold text-ink` (one step darker than the
  surrounding text, not just heavier).

---

## 4. Shape, depth and texture

| Property | Values |
| --- | --- |
| Radius | `rounded-md` (chips, small badges), `rounded-lg` (icon buttons), `rounded-xl` (buttons, cards, evidence items), `rounded-2xl` (composer, drop zone, user bubble, mobile sheet), `rounded-full` (suggestion pills, icon discs) |
| Borders | 1px `border-line` by default; `border-line-strong` for inputs; 2px dashed for the drop zone |
| Shadow | Single token `shadow-paper`, a soft lift. Don't stack or invent other shadows. |
| Texture | `.paper-grain` (faint dot grid) only on the upload card |
| Marker | `.marker` paints a highlighter stroke across the lower ~35% of the text |

User bubbles use `rounded-2xl rounded-br-md` so they read as a tail toward the
right edge.

---

## 5. Layout

```
≥1280px (xl)   ┌ Sidebar 272 ┬──── Conversation (max 720) ────┬ Evidence 380 ┐
1024–1279 (lg) ┌ Sidebar 272 ┬──── Conversation ──────────────┐  drawer →
<1024          ┌ Top bar: brand · New · theme ┐
               │ Conversation                 │  evidence = bottom sheet (<640)
               └ Composer                     ┘              or right drawer (≥640)
```

- The app shell is `h-dvh overflow-hidden`. Only the conversation and the
  evidence list scroll (`.scroll-thin`).
- The reading column is capped at **720px** and centred. Gutters are `px-4`
  on mobile and `sm:px-8` from 640px up.
- The composer is pinned to the bottom with a hairline top border and
  `bg-paper/90 backdrop-blur`. It is **hidden until a document exists**. The
  empty state is a full-page hero.
- Breakpoint constants: the "wide screen" check in `page.tsx` is
  `(min-width: 1280px)` and must match Tailwind `xl`.

---

## 6. Components

### Brand (`Sidebar.tsx`)
`LogoMark` (an ink tile with a paper sheet and a highlighted line) plus the
serif wordmark "DocuMind". The mark is drawn with tokens, so it inverts
correctly in dark mode.

### Sidebar
- Primary button: `bg-ink text-paper`, label "Upload a PDF", which becomes
  "New document" once a document is loaded.
- "Reading" section: a document card (PDF glyph, filename clamped to 2 lines,
  green "Indexed and ready", a 3-up stats grid of Pages / Passages / Size in mono).
- Empty placeholder: dashed border with a muted icon and one line of copy.
- Footer: a serif italic pull quote stating the product promise.

### Empty state (`EmptyState.tsx`)
- Accent eyebrow "Document Q&A, with receipts", then the hero headline with
  `.marker` on *Understand*, then one sentence of explanation.
- Drop zone: a dashed outer frame around a raised paper card. On drag-over the
  frame turns `border-accent bg-accent-soft/60` and the copy becomes "Drop it here".
- Uploading: a miniature page with a highlighter **scan line** animation, the
  filename, a stage label (Reading pages → Splitting into passages → Embedding
  passages → Saving to the index) and a 4-segment progress bar. Stages advance
  on a 2.2s timer. They are indicative only, not real backend progress.
- Below the zone: three numbered steps in a hairline-divided grid.

### Messages (`ChatMessage.tsx`)
- **User:** right-aligned ink bubble, sans font.
- **Assistant:** `LogoMark` avatar and serif prose with no bubble. The intro
  message is italic and has no actions.
- **Actions row:** a "N sources" pill (highlighted when this answer is focused)
  and a ghost Copy button that shows "Copied" for 1.6s.
- **Thinking:** three bouncing accent dots and "Searching the document…".

### Answer rendering (`AnswerText.tsx`)
A small, safe markdown subset rendered as React elements (never `innerHTML`):
paragraphs, line breaks, `#` headings, `-`/`*`/`•` and `1.` lists, `**bold**`
and `` `code` ``.

**Citation chips** replace `[Source 1]`, `[Source 1, Source 3]` and
`[Sources 1, 2]`:
- Default: `bg-highlight-soft ring-1 ring-highlight`, a small semibold number.
- Active (selected): `bg-ink text-paper`.
- An out-of-range number renders disabled at 50% opacity.

### Evidence panel (`EvidencePanel.tsx`)
- Header: serif "Evidence" with the subtitle *For "<question>"*.
- Cards: an index badge, `PAGE n` in mono caps, and a match meter (accent bar
  plus a percentage, showing similarity × 100). The passage is in serif,
  clamped to 5 lines.
- Active card: `border-highlight bg-highlight-soft shadow-paper`, unclamped,
  and scrolled into view.
- Empty: a quote icon with "No evidence yet".

### Composer (`Composer.tsx`)
- A raised rounded-2xl container. Focus is shown on the **container**
  (`focus-within:border-ink-muted`), not the textarea.
- The textarea auto-grows up to 200px. Enter sends, Shift+Enter adds a new
  line, and IME composition is respected.
- Send: a 40px square accent button with an arrow. When disabled it becomes
  `bg-paper-sunken text-ink-muted`.
- Suggestion pills appear only before the first question. On hover they turn
  accent.
- Footnote: keyboard hint (hidden on mobile) plus "Check important claims
  against the cited pages."

### Error banner (`page.tsx`)
`bg-danger-soft text-danger`, an alert icon, the message and a dismiss button.
It sits above the composer with `role="alert"`.

### Icons (`icons.tsx`)
Inline SVG, 24px grid, 1.7 stroke (2 for arrows and checks), round caps,
`currentColor`, `aria-hidden`. The default render size is 18px, or 14–16px in
compact rows. Add new icons here in the same style. Don't add an icon
library.

---

## 7. Interaction: the citation loop

This is the core of the product, so keep it intact:

1. A new answer with sources becomes the **focused** answer, and the evidence
   panel shows its sources.
2. Clicking a citation chip focuses that answer and selects that source. The
   chip and the card both turn active, and the card scrolls into view.
3. Clicking the "N sources" pill focuses the answer with no source selected.
4. Clicking an evidence card toggles its selection.
5. Below 1280px, steps 2 and 3 open the drawer or sheet. The backdrop or ✕
   closes it.

---

## 8. Motion

| Name | Class | Use |
| --- | --- | --- |
| Rise | `.animate-rise` (360ms, ease-out, 6px) | Entry of messages, cards, pills, banners, sheet |
| Scan | `.animate-scan` (1.6s loop) | Upload page highlighter |
| Typing dots | `.typing-dot` (1.2s, staggered 150ms) | Thinking indicator |
| Transitions | Tailwind `transition` | Hover and active colour changes |

All three keyframe animations are disabled under
`prefers-reduced-motion: reduce`. Any new animation must be added to that
block.

---

## 9. Accessibility

- Global focus ring: 2px accent outline with a 2px offset on every focusable
  element except textareas. It's declared as `:not(textarea):focus-visible` in
  `globals.css`, because an unlayered global rule beats Tailwind utilities.
- Icon-only buttons always have `aria-label` (theme, send, close, citation
  chips "Show source n").
- Live regions: the upload progress and thinking indicator use
  `role="status" aria-live="polite"`. Errors use `role="alert"`.
- The evidence drawer is `role="dialog" aria-modal="true"`.
- The composer textarea has a visually hidden `<label>`.
- Contrast: body text uses `ink-soft` or stronger. `ink-muted` is for
  secondary text only, never for essential content.
- Touch targets are at least 36px (icon buttons are 36–40px).

---

## 10. Voice and copy

- Plain, calm and specific. Say what happened and what to do next:
  "That PDF is larger than 10 MB. Try a smaller file." Not "Error: invalid file".
- No hype words ("magic", "supercharge", "AI-powered"), no emoji, no
  exclamation marks.
- Use sentence case everywhere except eyebrow labels, which are uppercase via CSS.
- Use curly quotes in UI strings (“ ”) and an ellipsis character (…) for
  in-progress states.

---

## 11. Do / Don't

| Do | Don't |
| --- | --- |
| Use token utilities (`bg-paper-raised`, `text-ink-muted`) | Hard-code hex or Tailwind palette colours (`bg-violet-600`, `text-slate-400`) |
| Keep the serif for reading surfaces | Set buttons or labels in the serif |
| Reserve yellow for evidence | Use the highlighter as a decorative fill |
| Use one accent CTA per view | Put accent on several competing buttons |
| Add icons to `icons.tsx` in the same stroke style | Mix in emoji or another icon set |
| Update both dark-mode blocks together | Edit only the media-query block |
| Add new motion to the reduced-motion block | Ship animation that ignores the user's setting |

---

## 12. File map

| File | Responsibility |
| --- | --- |
| `src/app/globals.css` | Tokens, theme blocks, base styles, utilities (`.marker`, `.paper-grain`, `.scroll-thin`), keyframes |
| `src/app/layout.tsx` | Fonts, metadata |
| `src/app/page.tsx` | App state, shell layout, evidence column and drawer, error banner |
| `src/components/Sidebar.tsx` | `Brand`, sidebar, document card |
| `src/components/EmptyState.tsx` | Hero, drop zone, upload progress, steps |
| `src/components/ChatMessage.tsx` | User and assistant messages, thinking indicator |
| `src/components/AnswerText.tsx` | Markdown subset and citation chips |
| `src/components/EvidencePanel.tsx` | Source cards and match meter |
| `src/components/Composer.tsx` | Input, send, suggestions |
| `src/components/ThemeToggle.tsx` | Light/dark toggle |
| `src/components/icons.tsx` | Icon set and `LogoMark` |
| `src/lib/api.ts` | API calls, PDF validation, `formatBytes` |
| `src/lib/types.ts` | `Source`, `Message`, `DocumentInfo` |
