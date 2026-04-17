# Board Page — Design Overrides

Inherits MASTER.md. Rules below take priority.

## Kanban Layout
- 5 columns equal width, horizontal scroll if needed
- Column headers: status label + count badge + "Add" icon button
- Column: bg-bg-card/50, rounded-[14px], min-h-[80vh], p-3

## Cards
- bg-bg-card border border-white/[0.06]
- Company: text-xs text-text-muted
- Title: text-sm font-semibold
- FitBadge: bottom-right, small pill
- Dragging: scale(1.03) + shadow-modal + border-cyan-500/30
- Hover: border-white/10

## JobDrawer
- Slides in from right, 480px wide
- Scrim: bg-black/60 backdrop-blur-sm
- Close: top-right X button + click-outside
- JdMatchPanel: inside drawer, after job details
- Action buttons: sticky at drawer bottom
  - Primary: "Mark Applied" gradient
  - Secondary: "Cover Letter", "Interview Prep" text buttons

## JdMatchPanel
- 5 bars (horizontal), each labeled
- Bar fill: gradient based on score
- Overall grade: large letter (A/B/C/D/F) with color
- "Tailor Resume" CTA → /resume?jd_id=

## AddJobModal
- Centered modal, max-w-lg
- Fields: Title, Company, Location, URL, Notes
- Source auto-set: "manual"
- Submit → toast success + card appears in "saved" column
