---
name: web-design-guidelines
description: Review and audit UI code against Web Interface Guidelines, WCAG accessibility standards, responsive layouts, focus states, interactive controls, typography rhythm, and performance best practices. Outputs issues in terse file:line format. Use when asked to "review my UI", "audit design", "check accessibility", or "review UX".
---

# Web Interface Guidelines Skill

Use this skill to perform automated or manual design audits on frontend code (React, Next.js, HTML, Vue, CSS/Tailwind) following the **Web Interface Guidelines**.

---

## When to Use This Skill

Activate this skill when:
- The user asks: *"Review my UI"*, *"Check accessibility"*, *"Audit design"*, *"Review UX"*, or *"Check my components against best practices"*.
- Auditing new or existing pages, forms, modals, navigation bars, or cards.
- Ensuring compliance before pushing code to production or creating a pull request.

---

## Audit Workflow

1. Identify target file(s) or component paths specified by the user.
2. Read the files and evaluate every JSX/HTML element and CSS rule against the audit checklist below.
3. **Output findings in terse `file:line` format** (e.g. `src/components/Button.tsx:24 - Missing aria-label on icon button`).
4. Prioritize actionable fixes directly in the report without verbose padding.

---

## Comprehensive Guideline Rules

### 1. Accessibility (a11y)
- **Buttons vs Links**: Use `<button>` for actions/state changes, `<a>` or `<Link>` for navigation. Never `<div onClick>`.
- **Icon-Only Buttons**: Must have `aria-label` or `<span className="sr-only">Label</span>`.
- **Form Controls**: Every `<input>`, `<select>`, `<textarea>` must have an associated `<label>` (via `htmlFor` or wrapping) or explicit `aria-label`.
- **Keyboard Handlers**: Interactive non-native elements must support `Enter` and `Space` key triggers.
- **Images**: Every `<img>` requires `alt` text (use `alt=""` only for purely decorative images).
- **Decorative Icons**: Add `aria-hidden="true"` to prevent screen reader noise.
- **Async Updates**: Dynamic messages, toasts, and validation errors need `aria-live="polite"`.
- **Heading Hierarchy**: Maintain strict sequential heading levels (`<h1>` through `<h6>`).

### 2. Focus States
- **Visible Indicators**: Every focusable control must have visible `:focus-visible` styling (e.g. `focus-visible:ring-2 focus-visible:outline-none`).
- **Never Bare Outline-None**: Never write `outline: none` or `outline-none` without providing an active focus ring replacement.
- **Focus Rings on Click**: Prefer `:focus-visible` over `:focus` to prevent unsightly rings upon mouse click while maintaining keyboard access.
- **Sticky Element Overlap**: Ensure sticky headers, footers, or overlays do not obscure the currently focused input.

### 3. Forms & Inputs
- **Autocomplete**: Always provide relevant `autoComplete` attributes (e.g. `email`, `tel`, `address-line1`, `current-password`).
- **Input Types & Modes**: Use semantic types (`type="email"`, `type="tel"`, `type="url"`) and `inputMode="numeric"` for phone/PIN numbers.
- **Never Block Paste**: Do not attach `onPaste={(e) => e.preventDefault()}` on passwords or credit card fields.
- **Inline Errors**: Position error messages immediately adjacent to the offending input and tie with `aria-describedby`.
- **Button Feedback**: Keep submit buttons enabled until network request begins; display a loading indicator during submission.

### 4. Animation & Motion
- **Reduced Motion**: Always honor user preference with `@media (prefers-reduced-motion: reduce)` or Tailwind `motion-reduce:`.
- **Compositor Safety**: Animate only GPU-accelerated properties: `transform` and `opacity`. Avoid animating `width`, `height`, `top`, or `margin`.
- **Transition Explicit**: Avoid `transition: all`. Explicitly specify transitioned properties (e.g. `transition-transform duration-200`).
- **Interruptible**: Micro-interactions must respond fluidly if the user moves their pointer away mid-animation.

### 5. Typography & Copy Details
- **Ellipsis**: Use proper unicode ellipsis `…` (`&hellip;`), never three raw periods `...`.
- **Typographic Quotes**: Use curly quotes `“` `”` instead of straight quotes `"` in display copy.
- **Widow Prevention**: Use `text-wrap: balance` on headings and `text-wrap: pretty` on paragraphs.
- **Non-Breaking Spaces**: Use `&nbsp;` between numbers and units (e.g. `10&nbsp;USD`, `5&nbsp;items`).
- **Tabular Figures**: Use `font-variant-numeric: tabular-nums` (Tailwind `tabular-nums`) for currency, timers, and data table numbers.

### 6. Content Handling & Resilience
- **Truncation & Overflow**: Ensure flex children have `min-w-0` to allow `truncate` or `line-clamp-*` to function properly.
- **Empty States**: Always handle nullish or empty arrays with dedicated empty-state illustrations or copy instead of empty blank panels.
- **Extreme Strings**: Stress-test card headers and usernames with both 3-character and 60-character inputs.

### 7. Images & Layout Stability (CLS)
- **Prevent CLS**: Always define explicit `width` and `height` or `aspect-ratio` on image containers.
- **Lazy Loading**: Use `loading="lazy"` for below-the-fold media; use priority loading (`priority` in Next.js Image) for above-the-fold heroes.

### 8. Performance & DOM Safety
- **Layout Thrashing**: Never interleave DOM style mutations and layout reads (`getBoundingClientRect()`, `offsetHeight`).
- **Large Lists**: Virtualize lists containing more than 50 complex cards.

---

## Output Report Template

When performing an audit, structure your response as:

```markdown
### 🔍 Web Interface Guidelines Audit Report

#### `path/to/Component.tsx`
- **Line 32**: ⚠️ `button` has SVG icon with no accessible label. Fix: Add `aria-label="Cerrar modal"` or `<span className="sr-only">`.
- **Line 48**: ⚠️ Input uses `outline-none` without `focus-visible:ring`. Fix: Add `focus-visible:ring-2 focus-visible:ring-primary`.
- **Line 75**: ⚠️ Card title wraps with orphaned single word. Fix: Add `text-wrap: balance`.

#### Summary & Recommended Fixes
[Quick copy-paste code snippets for the identified lines]
```
