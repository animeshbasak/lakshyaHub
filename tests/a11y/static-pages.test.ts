/**
 * Accessibility test scaffold for static + SSR-rendered public pages.
 *
 * IMPORTANT: axe-core requires a real browser runtime (jsdom is not enough —
 * its `Window` lacks several DOM APIs axe relies on). The intent is to wire
 * these tests via `@axe-core/playwright` once we add Playwright as a runner.
 * For now this file:
 *   - Lists target routes (/, /pricing, /about) so the surface is tracked.
 *   - Renders a sanity assertion that the routes array is non-empty.
 *   - Holds 6 `.todo` placeholders — one per audit target — that any future
 *     Playwright-based runner can fill in without changing this file's
 *     external shape.
 *
 * To wire later:
 *   1. npm install -D @axe-core/playwright @playwright/test
 *   2. Create playwright.config.ts pointing at A11Y_BASE_URL
 *   3. Move the .todo cases into a Playwright test that does:
 *        await injectAxe(page); await checkA11y(page, null, { ... })
 *   4. CI: GitHub Actions step running `npx playwright test tests/a11y/`
 *      against a Vercel preview deployment.
 *
 * Why we don't run the browser-based check in this Vitest run:
 *   - Spawning Chromium per test triples CI time
 *   - jsdom + axe-core surfaces false positives that drown the real signal
 *   - Playwright is the standard pattern that scales to E2E coverage
 */
import { describe, it, expect } from 'vitest'

const ROUTES = ['/', '/pricing', '/about', '/login', '/share/[id]', '/eval/[id]'] as const

describe('a11y target inventory', () => {
  it('every public route is enumerated', () => {
    expect(ROUTES.length).toBeGreaterThanOrEqual(3)
    expect(ROUTES).toContain('/')
    expect(ROUTES).toContain('/pricing')
    expect(ROUTES).toContain('/about')
  })
})

describe('a11y axe-core (todo — needs Playwright runner)', () => {
  it.todo('GET / has no serious/critical WCAG 2.2 AA violations')
  it.todo('GET /pricing has no serious/critical WCAG 2.2 AA violations')
  it.todo('GET /about has no serious/critical WCAG 2.2 AA violations')
  it.todo('GET /login has no serious/critical WCAG 2.2 AA violations')
  it.todo('GET /share/[id] (with seeded public eval) has no serious/critical violations')
  it.todo('GET /eval/[id] (authed via test user) has no serious/critical violations')
})
