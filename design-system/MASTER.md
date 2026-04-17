# Lakshya Hub — Design System Master

**Style:** Modern Dark (Cinema) — AI Career Platform
**Stack:** Next.js 16 + Tailwind CSS 4
**Last audited:** 2026-04-11

---

## Color Tokens (globals.css → use CSS vars, never raw hex)

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#0a0a0f` | Page background |
| `--bg-card` | `#111118` | Cards, panels |
| `--bg-card-hover` | `#16161f` | Card hover state |
| `--bg-input` | `#1a1a24` | Input fields |
| `--cyan` | `#22d3ee` | Primary accent, active states |
| `--purple` | `#a855f7` | Secondary accent, gradient pair |
| `--green` | `#10b981` | Success, fit score high |
| `--amber` | `#f59e0b` | Warning, fit score medium |
| `--red` | `#ef4444` | Destructive, error, fit score low |
| `--text` | `#f1f5f9` | Primary text (≥4.5:1 on bg) |
| `--text-2` | `#94a3b8` | Secondary text |
| `--text-muted` | `#475569` | Placeholder, metadata — use only on bg-card |
| `--border` | `rgba(255,255,255,0.06)` | Default borders |
| `--border-hover` | `rgba(34,211,238,0.3)` | Hover borders |
| `--gradient-primary` | cyan→purple 135deg | Gradient text, CTAs |

### ⚠ Contrast Warning
`--text-muted (#475569)` on `--bg (#0a0a0f)` = ~3.9:1 — **fails WCAG AA (4.5:1)**.
**Rule:** Only use `--text-muted` on `--bg-card` (#111118) where contrast is sufficient, or bump to `--text-2` for anything important.

---

## Typography

**Font:** Geist Sans (already loaded via next/font/google)
**Scale:**

| Role | Size | Weight | Class |
|---|---|---|---|
| Page title | 28–32px | 700 | `text-3xl font-bold` |
| Section heading | 20–24px | 600 | `text-xl font-semibold` |
| Card title | 16px | 600 | `text-base font-semibold` |
| Body | 14–16px | 400 | `text-sm` or `text-base` |
| Label / badge | 10–12px | 700 | `text-xs font-bold uppercase tracking-widest` |
| Metadata | 11–12px | 500 | `text-[11px] font-medium` |

**Line height:** 1.5 body, 1.2 headings
**Never:** text below 10px, raw gray-on-gray

---

## Spacing Scale (8dp grid)

| Token | Value |
|---|---|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |
| 2xl | 48px |
| 3xl | 64px |

Use Tailwind multiples of 4: `p-2 p-4 p-6 p-8 p-12 p-16`

---

## Border Radius

| Context | Value | Class |
|---|---|---|
| Cards, panels | 14px | `rounded-[14px]` or `rounded-xl` |
| Buttons, inputs | 12px | `rounded-xl` |
| Badges, pills | 999px | `rounded-full` |
| Small elements | 8px | `rounded-lg` |

---

## Elevation / Shadows

| Level | Usage | CSS |
|---|---|---|
| 0 | Flat (inputs) | none |
| 1 | Cards | `shadow-[0_1px_3px_rgba(0,0,0,0.4)]` |
| 2 | Popovers, dropdowns | `shadow-[0_4px_16px_rgba(0,0,0,0.5)]` |
| 3 | Modals, sheets | `shadow-[0_8px_32px_rgba(0,0,0,0.6)]` |
| Glow | CTAs, active accent | `shadow-[0_0_20px_rgba(34,211,238,0.15)]` |

---

## Component Patterns

### Cards
```tsx
<div className="bg-bg-card border border-white/[0.06] rounded-[14px] p-5 hover:border-cyan-500/30 transition-colors">
```

### Primary Button
```tsx
<button className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold px-5 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
```

### Secondary Button
```tsx
<button className="bg-white/5 border border-white/10 text-white font-medium px-5 py-3 rounded-xl hover:bg-white/10 transition-colors">
```

### Input
```tsx
<input className="w-full bg-bg-input border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-muted focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all">
```

### Badge / Chip
```tsx
// Status badge
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
```

### Skeleton Loader
```tsx
<div className="animate-pulse bg-white/[0.05] rounded-[14px] h-24 w-full">
```

---

## Animation Tokens

| Name | Duration | Easing | Use |
|---|---|---|---|
| micro | 150ms | ease-out | Hover, focus |
| standard | 200ms | ease-out | State change |
| enter | 250ms | cubic-bezier(0.16,1,0.3,1) | Modal open, panel slide |
| exit | 180ms | ease-in | Modal close |
| page | 300ms | ease-out | Route transition |

**Rule:** `transform` + `opacity` only. Never animate `width/height/top/left`.
**Rule:** `@media (prefers-reduced-motion: reduce)` — set `transition-duration: 0ms`.

---

## FitScore Color System

| Score | Color | Token | Usage |
|---|---|---|---|
| 75–100 | Green | `--green` / `text-emerald-400` | Strong match |
| 50–74 | Amber | `--amber` / `text-amber-400` | Partial match |
| 0–49 | Red | `--red` / `text-red-400` | Poor match |

Always pair score color with text label (not color alone).

---

## Application Status Colors

| Status | Color | Badge class |
|---|---|---|
| saved | Blue/cyan | `bg-cyan-500/10 text-cyan-400` |
| applied | Purple | `bg-purple-500/10 text-purple-400` |
| interview | Amber | `bg-amber-500/10 text-amber-400` |
| offer | Green | `bg-emerald-500/10 text-emerald-400` |
| rejected | Red | `bg-red-500/10 text-red-400` |

---

## Icon System

**Library:** Lucide React (already installed)
**Sizes:** `w-4 h-4` (inline), `w-5 h-5` (nav/card), `w-6 h-6` (feature)
**Style:** All outline, consistent stroke-width (default 2)
**Never:** Emojis as icons, mixing filled + outline at same level

---

## Z-Index Scale

| Layer | Value | Usage |
|---|---|---|
| base | 0 | Content |
| card | 10 | Cards |
| dropdown | 40 | Dropdowns, tooltips |
| sidebar | 50 | Fixed sidebar |
| modal-overlay | 100 | Drawer scrim |
| modal | 200 | Modals, drawers |
| toast | 1000 | Toast notifications |

---

## Accessibility Rules (non-negotiable)

1. **Contrast:** primary text ≥4.5:1, secondary ≥3:1, icons ≥3:1
2. **Focus:** every interactive element needs `focus-visible:ring-2 focus-visible:ring-cyan-500/50`
3. **Touch targets:** min `min-h-[44px] min-w-[44px]` for all buttons/links
4. **Labels:** every input has `<label>` or `aria-label`
5. **Loading:** disabled + spinner on async buttons, skeleton on loading content
6. **Error:** error text below field, `role="alert"` for screen readers
7. **Color:** never use color as the ONLY differentiator (add text/icon)

---

## Globals.css Additions Needed

Add to `:root` in globals.css:
```css
/* Missing: animation tokens */
--duration-micro: 150ms;
--duration-standard: 200ms;
--duration-enter: 250ms;
--duration-exit: 180ms;
--ease-spring: cubic-bezier(0.16, 1, 0.3, 1);

/* Missing: focus ring */
--focus-ring: 0 0 0 3px rgba(34, 211, 238, 0.3);

/* Missing: spacing tokens */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
```

Add global focus style:
```css
:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
  border-radius: var(--radius-sm);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
