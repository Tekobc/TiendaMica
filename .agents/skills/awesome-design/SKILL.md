---
name: awesome-design
description: Design system catalog and aesthetic switcher inspired by the Awesome Design Skills ecosystem. Provides 10+ curated aesthetic styles (Bento, Brutalism, Minimal, Clean Modern, Editorial/Luxury, Retro 90s, Paper/Craft, Glassmorphism, Cyberpunk, Boutique E-Commerce) with explicit color palettes, typography scales, spacing tokens, and component guidelines for instant styling in web applications.
---

# Awesome Design: Curated Design System Catalog

Inspired by the **Awesome Design Skills** ecosystem, this skill provides ready-to-apply design system styles, tokens, and aesthetic recipes for web applications.

---

## When to Use This Skill

Activate this skill when:
- Designing a new UI component or landing page from scratch.
- The user asks for a specific visual direction: *"Make this look like Bento"*, *"Apply a Brutalist style"*, *"Give it an Editorial look"*, *"Apply a Linear dark-tech aesthetic"*, or *"Redesign with modern boutique vibes"*.
- Switching or theming the visual identity of existing components.
- Looking for coherent palettes, typography pairings, border radii, and shadow recipes.

---

## The Aesthetic Catalog

### 1. Bento Grid (Modular & Organized)
*Best for: Dashboards, feature sections, product showcases, landing pages.*
- **Visual Style**: Structured cards of asymmetric sizes (1x1, 2x1, 2x2) within a tight CSS grid.
- **Palette**: Surface `#F8FAFC`, Border `#E2E8F0`, Text `#0F172A`, Accent `#3B82F6` or `#F97316`.
- **Radii & Borders**: `rounded-2xl` or `rounded-3xl`, `border border-slate-200/80`.
- **Shadows**: Soft diffuse elevation: `shadow-sm hover:shadow-md transition-shadow`.
- **Typography**: Clean grotesque sans (`Inter`, `Plus Jakarta Sans`).

### 2. Neo-Brutalism (Bold, High-Contrast & Playful)
*Best for: Creative portfolios, tech-forward marketing, Gen-Z products.*
- **Visual Style**: High contrast, stark outlines, flat bright color blocks, hard drop shadows without blur.
- **Palette**: Canvas `#FFFDF8`, Accent `#FFE600` (Yellow), `#FF5E5E` (Coral), `#00F0FF` (Cyan), Ink `#000000`.
- **Radii & Borders**: `rounded-md` or `rounded-none`, thick border `border-2 border-black` or `border-[3px] border-black`.
- **Shadows**: Hard offset shadow: `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`.
- **Typography**: Punchy bold display (`Syne`, `Space Grotesk`, `JetBrains Mono`).

### 3. Clean Modern / Linear Style (Technical Dark Mode)
*Best for: Developer tools, SaaS, high-productivity software, modern dashboards.*
- **Visual Style**: Deep obsidian canvas, hairline borders, subtle glow accents, restrained micro-motion.
- **Palette**: Canvas `#09090B`, Surface `#121215`, Border `#27272A`, Text `#FAFAFA`, Muted `#A1A1AA`, Accent `#6366F1` or `#10B981`.
- **Radii & Borders**: `rounded-lg` or `rounded-xl`, subtle hairline border `border border-zinc-800/80`.
- **Shadows**: Ambient glow or deep rim shadow: `shadow-[0_0_25px_-5px_rgba(99,102,241,0.15)]`.
- **Typography**: Geometric monospace + neutral grotesque (`Geist Sans`, `Geist Mono`).

### 4. Editorial & Luxury (Sophisticated & Organic)
*Best for: High-end boutiques, fashion, literary journals, architecture, lifestyle.*
- **Visual Style**: Generous whitespace, refined serif headers, muted warm palette, high-fashion imagery.
- **Palette**: Canvas `#FDFCF7` (Alabaster), Surface `#F5F2EB`, Ink `#1A1A18`, Accent `#8C7355` (Warm Ochre).
- **Radii & Borders**: `rounded-sm` or `rounded-none`, delicate borders `border border-[#E5E0D4]`.
- **Shadows**: Subtle or none (`shadow-none` with tonal surface layer contrast).
- **Typography**: Refined serif display (`Instrument Serif`, `Playfair Display`) + crisp light body (`Inter` 300/400).

### 5. Glassmorphism (Translucent & Ambient)
*Best for: Floating HUDs, modern overlays, premium mobile web apps.*
- **Visual Style**: Frosted glass panes over colorful or ambient gradient backdrops.
- **Recipe**:
  - `bg-white/10 dark:bg-black/30`
  - `backdrop-blur-md backdrop-saturate-150`
  - `border border-white/20 dark:border-white/10`
  - `shadow-lg shadow-black/5`

### 6. Boutique E-Commerce (Tactile & Conversion-Focused)
*Best for: Fashion storefronts, artisan goods, local businesses (e.g. TiendaMica).*
- **Visual Style**: Clean product-centric cards, warm tactile surfaces, obvious primary actions, trust badges.
- **Palette**: Canvas `#FFFFFF`, Surface `#F9FAFB`, Accent `#E11D48` (Rose) or `#D97706` (Amber), Ink `#111827`.
- **Card Design**: Rounded image container (`rounded-xl overflow-hidden`), price in `tabular-nums font-semibold`.
- **Interaction**: Quick add-to-cart button sliding up on card hover, sticky mobile CTA bar.

---

## How to Apply a Style

When requested to build or restyle UI with a style from Awesome Design:
1. Identify the chosen style archetype (e.g., *Bento*, *Neo-Brutalism*, *Boutique E-Commerce*).
2. Apply the style's baseline tokens to container wrapper, typography classes, border utilities, and button states.
3. Keep component hierarchy consistent with the aesthetic rules (do not mix hard brutalist shadows with soft glassmorphism blur in the same viewport).
4. Review against accessibility contrast standards (ensure text on colored surfaces passes 4.5:1 ratio).
