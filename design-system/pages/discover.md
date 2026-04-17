# Discover Page — Design Overrides

Inherits MASTER.md. Rules below take priority.

## Layout
Left column (400px fixed): QueryBuilder stepper
Right column (flex-1): Results / Session Log

## QueryBuilder
- 4 steps: Role | Location | Sources | Token
- Step indicator: horizontal pills, active = cyan fill
- Each step: card with form fields
- "Run Search" CTA: gradient button, full width, prominent

## Session Log (during scrape)
- Card with real-time entries
- Type icons: info=cyan, success=green, warn=amber, error=red
- Each entry: icon + timestamp + message
- Animated: new entries slide in from bottom
- Status header: "Searching LinkedIn…" with spinner

## Job Result Cards
- FitBadge: large, right-aligned, colored by score tier
- Company + title prominent
- Location + source + salary in text-text-2
- "Add to Board" button: appears on hover (desktop), always visible (mobile)
- Truncate description at 2 lines

## Empty States
- Pre-search: illustration + "Configure your search above"
- No results: "No matches. Try broader keywords or different sources."
