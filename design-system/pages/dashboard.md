# Dashboard Page — Design Overrides

Inherits MASTER.md. Rules below take priority.

## Layout
- 3-zone grid: stats row (top) + main 2-col (left: resume card + funnel, right: recent jobs)
- Stats row: 4 cards, equal width, 16px gap
- Main area: `grid-cols-[2fr_1fr]` gap-6
- No hero section — app is post-login, content-first

## Stats Cards
- Small format: icon + number + label
- Number: 28px font-bold, gradient-text for key metric
- Icon: 40×40 bg-cyan-500/10 rounded-xl, icon w-5 text-cyan-400
- Hover: subtle border-cyan-500/20 transition

## Pipeline Funnel
- Horizontal bar segments, proportional width
- Each segment: status color (see MASTER.md status colors)
- Label + count above segment
- Empty state: dashed border + "Add your first application"

## Resume Status Card
- If no resume: large empty state, CTA "Build Resume" → /resume
- If resume: template name, last saved, ATS score badge, "Edit" button

## Empty States
- Centered, icon 48×48, h2 + p + primary CTA button
- Text: "No jobs yet. Run your first search →"
- Never: blank space with no guidance

## Quick Actions
- Prominent "Run Job Search" button → /discover
- Secondary "Upload Resume" → /resume
