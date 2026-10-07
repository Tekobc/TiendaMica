---
name: design-token
description: Create, validate, and maintain W3C DTCG-compliant design token JSON files (.tokens.json, tokens.json, resolver files) and design systems. Enforces semantic token hierarchy (Primitive -> Semantic -> Component), 13 standard token types, aliases, references, dark/light themes, and schema validation.
---

# W3C Design Tokens Skill

This skill provides guidelines and validation tools to create and maintain design tokens compliant with the **W3C Design Tokens Community Group (DTCG)** specification.

---

## When to Use This Skill

Activate this skill when:
- Creating or editing design token files (`*.tokens.json`, `tokens.json`, `theme.tokens.json`).
- Architecting a design token system (Colors, Typography, Spacing, Shadows, Radii, Motion).
- Defining multi-tier token hierarchies:
  1. **Tier 1 - Primitives** (Raw hex, px, ms values).
  2. **Tier 2 - Semantic** (Intent-based: surface, foreground, brand, status).
  3. **Tier 3 - Component** (Component-specific overrides: button-bg, card-radius).
- Validating token syntax, resolving references/aliases (`{color.brand.primary}`), or exporting tokens to CSS Custom Properties / Tailwind.

---

## Standard Token Format (DTCG Specification)

### Root Schema Header
Every new token file must declare the official `$schema`:
```json
{
  "$schema": "https://designtokens.org/schemas/2025.10/format.json"
}
```

### The 13 Official DTCG Token Types
| Type | Example Value | Description |
| :--- | :--- | :--- |
| `color` | `"#0F172A"` or `{"colorSpace": "srgb", "components": [0.06, 0.09, 0.16]}` | Hex, RGB, HSL, or color space object |
| `dimension` | `"16px"`, `"1rem"`, `"4pt"` | Measurements with explicit units |
| `fontFamily` | `["Inter", "sans-serif"]` | Single string or fallback array |
| `fontWeight` | `400`, `600`, `"bold"` | Numeric or standard keyword |
| `duration` | `"200ms"`, `"0.3s"` | Time durations with units |
| `cubicBezier` | `[0.16, 1, 0.3, 1]` | 4-number easing curve |
| `number` | `1.5`, `0.75` | Unitless scalar value (e.g. line-height) |
| `shadow` | `{"color": "#00000020", "offsetX": "0px", "offsetY": "4px", "blur": "8px"}` | Drop or inner shadow |
| `border` | `{"color": "{color.border.subtle}", "width": "1px", "style": "solid"}` | Composite border |
| `transition` | `{"duration": "200ms", "delay": "0ms", "timingFunction": [0.16, 1, 0.3, 1]}` | Transition definition |
| `strokeStyle` | `"solid"`, `"dashed"`, `"dotted"` | Stroke style string or dasharray |
| `gradient` | `[{"color": "#FFF", "position": 0}, {"color": "#000", "position": 1}]` | Stops and direction |
| `typography` | Composite of `fontFamily`, `fontSize`, `fontWeight`, `lineHeight` | Reusable text style |

---

## Architecture: 3-Tier Hierarchy

```
┌────────────────────────────────────────┐
│  Tier 1: Primitives (Base Values)       │
│  blue.500: #3B82F6 | space.4: 16px     │
└───────────────────┬────────────────────┘
                    │ referenced by
┌───────────────────▼────────────────────┐
│  Tier 2: Semantic (Intent & Mode)      │
│  color.interactive.primary: {blue.500} │
│  color.surface.canvas: {gray.50}       │
└───────────────────┬────────────────────┘
                    │ referenced by
┌───────────────────▼────────────────────┐
│  Tier 3: Component (Scoped)            │
│  button.primary.bg: {color.interactive}│
└────────────────────────────────────────┘
```

### Reference / Alias Syntax
Use curly braces containing the full dotted path:
```json
{
  "color": {
    "brand": {
      "primary": {
        "$type": "color",
        "$value": "{color.primitive.blue.600}"
      }
    }
  }
}
```

---

## Validation & Script Execution

Use the bundled validator to check token files:
```bash
node .agents/skills/design-token/scripts/validate.js path/to/tokens.json
```

### Self-Check Checklist:
1. Every token has `$value`.
2. Every token has `$type` explicitly or inherited from its parent group.
3. Reference paths match existing nodes (`{group.token}`).
4. Dimensions include valid units (`px`, `rem`, `em`, `vh`, `%`).
5. Hex colors use `#RRGGBB` or `#RRGGBBAA`.
