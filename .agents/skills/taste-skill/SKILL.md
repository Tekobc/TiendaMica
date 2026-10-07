---
name: taste-skill
description: Anti-slop frontend and UI design skill for modern landing pages, portfolios, e-commerce, and redesigns. Reads the room and brief first, sets the 3 tunable dials (DESIGN_VARIANCE, MOTION_INTENSITY, VISUAL_DENSITY), bans generic AI defaults (purple gradients, 3 equal cards, generic Inter), and enforces high-taste typography, contrast, layout asymmetry, and motion choreography.
---

# taste-skill: Anti-Slop Frontend & UI Skill

> Designed for landing pages, storefronts, portfolios, and redesigns.
> Every rule below is **contextual**. First read the brief, set your dials, then pull only what fits.

---

## 0. Brief Inference: Read the Room First

Before touching code or tweaking dials, **infer what the user actually needs**. Standard LLM design output looks generic because models default to statistically safe aesthetics instead of reading the room.

### 0.A Signals to Read
1. **Page Kind**: Storefront / e-commerce, SaaS landing, designer portfolio, redesign, editorial.
2. **Vibe Words**: "minimalist", "calm", "Linear-style", "Awwwards", "brutalist", "premium consumer", "Apple-y", "playful", "trust-first".
3. **Reference Signals**: URLs linked, brands mentioned, competitors named, uploaded screenshots.
4. **Audience**: Shoppers, B2B procurement, design-conscious consumers, recruiters. The audience picks the aesthetic, not personal habit.
5. **Existing Brand Assets**: Logo, brand colors, typography, imagery. For redesigns, these are mandatory starting materials.
6. **Quiet Constraints**: High-contrast needs, mobile-first latency, trust-first commerce checkout.

### 0.B Output a One-Line "Design Read" Before Generating
State in one line:
> **"Reading this as: <page kind> for <audience>, with a <vibe> language, leaning toward <design system or aesthetic family>."**

*Example:*
> *"Reading this as: modern boutique storefront for design-conscious shoppers, with a calm editorial language, leaning toward Tailwind + warm neutrals + typography-led hierarchy."*

### 0.C Anti-Default Discipline
**Explicitly avoid default LLM tropes:**
- ❌ No generic AI-purple/indigo gradients (`from-indigo-500 to-purple-600`).
- ❌ No centered hero with 3 identical rounded cards beneath.
- ❌ No gratuitous glassmorphism on every element.
- ❌ No infinite-loop micro-animations everywhere without intent.
- ❌ No default `Inter` + `slate-900` combination for every single project.

---

## 1. The Three Dials (Core Configuration)

After declaring the design read, configure the 3 dials (scale 1 to 10):

* **`DESIGN_VARIANCE: 8`** — 1 = Strict Symmetry / Corporate, 10 = Artsy Chaos / Experimental
* **`MOTION_INTENSITY: 6`** — 1 = Static / Instant, 10 = Cinematic / Physics-based
* **`VISUAL_DENSITY: 4`** — 1 = Art Gallery / Spacious, 10 = Financial Terminal / Dense Data

**Baseline Default:** `7 / 6 / 4`

### Dial Presets by Use Case
| Use Case | VARIANCE | MOTION | DENSITY | Notes |
| :--- | :---: | :---: | :---: | :--- |
| **Storefront / E-commerce** | **7** | **5** | **4** | Tactile cards, high product focus, smooth micro-interactions |
| **Landing (SaaS, Mainstream)** | **7** | **6** | **4** | Clear CTA, social proof, crisp feature hierarchy |
| **Landing (Creative / Agency)** | **9** | **8** | **3** | Asymmetrical grids, oversized typography, kinetic scroll |
| **Portfolio (Developer/Designer)**| **8** | **7** | **3** | High personality, project highlights, refined details |
| **Editorial / Lookbook** | **6** | **4** | **3** | Rich typography, generous margins, photography forward |
| **Dashboard / Backoffice** | **3** | **2** | **8** | High data density, tabular figures, compact rows |

---

## 2. Typography & Color Execution

### Typography Pairings
- **Editorial / Premium**: `Instrument Serif` or `Playfair Display` (Headings) + `Inter` or `Geist` (Body).
- **Modern Tech / Linear-like**: `Geist Sans` + `Geist Mono` or `Plus Jakarta Sans`.
- **Expressive / Agency**: `Clash Display` or `Cabinet Grotesk` + `Satoshi`.
- **E-Commerce / Clean Retail**: `Plus Jakarta Sans` or `Outfit` with crisp medium weights.

### Color & Contrast Rules
- Build palettes with 60-30-10 distribution:
  - 60% Dominant canvas (`#FAFAFA` light or `#09090B` dark).
  - 30% Structural surface & typography (`#18181B`, `#27272A`, borders).
  - 10% Intentional accent (Electric Coral, Warm Amber, Emerald, Deep Cobalt).
- Ensure contrast ratio exceeds 4.5:1 for body copy and 3:1 for large display text.

---

## 3. Motion Choreography
- Use custom cubic-bezier curves for organic feel: `cubic-bezier(0.16, 1, 0.3, 1)` (out-expo).
- Duration budget:
  - Micro-interactions (hover, click, toggle): `150ms - 200ms`.
  - Panel transitions (drawers, dialogs): `300ms - 400ms`.
  - Page/hero reveals: `500ms - 700ms` with staggered delays (50ms increments).
- Respect accessibility: always wrap in `@media (prefers-reduced-motion: reduce)`.

---

## 4. Pre-Flight Quality Gate

Before finishing any UI work, verify:
1. Did I state the one-line Design Read?
2. Are the 3 dials set appropriately for this specific brief?
3. Did I avoid generic AI patterns (purple blobs, 3 identical cards)?
4. Is typography hierarchical with explicit font weights and line heights?
5. Does every button and interactive link have active/hover/focus-visible states?
