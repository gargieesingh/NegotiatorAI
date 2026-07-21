# NegotiatorAI — Agent Rules

## Core UI Rule: Always Inspired by NeuraTalk

**Every UI component, page, and layout in this project must be designed with inspiration from the NeuraTalk project (`C:\Users\Harsh\Desktop\neuratalk`).**

NeuraTalk is the design reference. Before building any new UI, study how NeuraTalk handles similar patterns and replicate that aesthetic.

---

## NeuraTalk Design Language Summary

### Typography
- **Primary font**: Satoshi (light 300, regular 400, medium 500, bold 700)
- **Secondary font**: Inter (for labels, UI text)
- **Display font**: InterDisplay (medium 500, headings)
- Body default: `font-satoshi text-p-sm text-strong-950`

### Color Tokens (Light Mode)
| Token | Value | Usage |
|---|---|---|
| `white-0` | `#ffffff` | Card/panel backgrounds |
| `strong-950` | `#0e121b` | Primary text |
| `weak-50` | `#f9fafc` | Page background, secondary fills |
| `sub-600` | `#525866` | Secondary/muted text |
| `soft-400` | `#99a0ae` | Placeholder text |
| `stroke-soft-200` | `#e1e4ea` | All borders, dividers |
| `information-base` | `#335cff` | Primary blue / CTA |
| `success-base` | `#1fc16b` | Success green |
| `error-base` | `#fb3748` | Errors |
| `feature-base` | `#7d52f4` | Purple / AI accent |

### Spacing & Shape
- **Border radius**: `rounded-3xl` (cards/panels), `rounded-2xl` (inner cards), `rounded-xl` (buttons/chips)
- **Card shadow**: `shadow-[0_0_1.25rem_0_rgba(0,0,0,0.03)]`
- **Panel padding**: `p-5` or `p-7.5` internally
- **Gaps**: `gap-4`, `gap-2`, `gap-1.5` — consistent 4px grid

### Sidebar & Layout
- Sidebar: `fixed top-5 left-5 bottom-5 w-80 bg-white-0 rounded-3xl shadow-[0_0_1.25rem_0_rgba(0,0,0,0.03)]`
- Main content area: sits beside sidebar, `bg-weak-50` page background
- Cards/chat wrappers: `bg-white-0 rounded-3xl shadow-[0_0_1.25rem_0_rgba(0,0,0,0.03)]`

### Interactive Elements
- **Buttons**: `rounded-xl`, `text-label-sm`, hover transitions via `transition-colors`
- **Active/selected nav items**: `bg-weak-50` background fill
- **Hover**: `hover:text-blue-500`, `hover:fill-blue-500`
- **Focus**: clean, no harsh outlines — uses `ring` only where needed

### Design Patterns
- Clean white cards with very subtle shadows — **no heavy drop shadows, no dark backgrounds**
- Borders are always `border-stroke-soft-200` (never black/dark)
- Status indicators: small dot, pastel pill badges
- Icons: consistently sized (`size-4`, `size-5`, `size-6`), filled, muted default colour
- Smooth `transition-colors` on all interactive elements (`duration-200`)
- Scrollbars hidden: `scrollbar-none`
- Dark mode supported via `[data-theme="dark"]` but light mode is primary

### What to Avoid
- ❌ No dark backgrounds invented on whims (slate-950, black terminals, etc.)
- ❌ No gradients unless NeuraTalk uses them
- ❌ No custom one-off shadow values (always use the `0_0_1.25rem_0_rgba(0,0,0,0.03)` pattern)
- ❌ No mismatched fonts — always Satoshi/Inter
- ❌ No raw text dumps in headers or titles
