# Resume Page — Design Overrides

Inherits MASTER.md. Rules below take priority.

## Layout
3-panel: FormPanel (left, 40%) | PreviewPanel (center, 35%) | AIPanel (right, 25%)
- FormPanel: scrollable, sticky section nav at top
- PreviewPanel: sticky, PDF preview scaled to fit
- AIPanel: collapsible, slide-in from right

## Form Sections
- Section headers: text-xs font-black uppercase tracking-widest text-text-muted + bottom border
- Section spacing: mb-6 between sections
- Input fields: bg-bg-input, consistent 44px min-height (touch target)
- Add row buttons: dashed border, hover bg-white/5, w-full

## Bullet Rows
- AI improve button: small, right-aligned, shows on hover only
- Loading state: spinner replaces icon, input disabled
- Improved: green glow border briefly (200ms), then normal

## Import Review Badges
- High confidence: green badge "✓ Verified"
- Medium: amber badge "~ Review"
- Low: red badge "! Check"
- Badges inline next to section heading

## PDF Preview
- White background preview (resume is light mode)
- Shadow: --shadow-modal around preview
- Template switcher: small pills above preview
- Scale to fit panel width

## AI Panel
- Tabs: JD Match | Bullet Rewrite | ATS Score
- JD Match: textarea for JD input + "Analyze" button
- ATS Score: circular gauge + checklist
- All AI actions: loading state with skeleton
