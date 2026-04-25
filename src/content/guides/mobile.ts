import type { ArchetypeGuide } from './ai-platform'

export const mobileGuide: ArchetypeGuide = {
  slug: 'mobile',
  archetype: 'mobile',
  title: 'How to land a Mobile Engineer (iOS / Android) role in 2026',
  metaDescription: 'A senior-IC playbook for landing Mobile Engineer roles in 2026 — what hiring managers screen for at Apple / Stripe / Cash App / Robinhood / Linear / Spotify, the platform-specific loop, salary bands by region, and how native-vs-cross-platform candidates score on the career-ops A-G rubric.',
  tagline: 'Build apps that don\'t embarrass the brand on a $1,200 device.',
  publishedAt: '2026-04-25',
  updatedAt: '2026-04-25',

  intro: `
Mobile engineering bifurcated through 2024-25. Native iOS / Android specialists pulled ahead in compensation and demand at premium-experience companies (Apple, Stripe, Robinhood, Cash App, Linear, Spotify). Cross-platform engineers (React Native, Flutter) clustered at vertical SaaS and earlier-stage companies where mobile is a strategic surface but not the entire moat. Both flavors are healthy in 2026, but the loops are sharply different.

If you've shipped a real app to a real app store with a non-trivial user base — not a personal project, not an internal-employee tool — you're qualified for senior-IC. This guide tells you what hiring managers at companies you'd want to work at actually probe for, and how to position whichever flavor you've shipped.

Lakshya's eval corpus has 130+ A-G evaluations against mobile roles across 80 companies. The pattern that scores 4.0+ overweights platform-specific depth + on-call + perf debugging.
  `.trim(),

  whoHires: [
    'Premium-experience product (Apple, Stripe, Robinhood, Cash App, Linear, Notion, Spotify)',
    'Fintech with mobile-first UX (Plaid app, Brex, Mercury, Wise, Razorpay, Slice, Cred)',
    'Vertical SaaS where mobile is the moat (Discord, Slack mobile, Headspace, Calm)',
    'Cross-platform shops (Shopify, Coinbase, Microsoft Teams, Reddit) — RN/Flutter expertise valued',
    'AI-native product mobile (Cursor mobile, Perplexity mobile, ChatGPT, Claude apps) — newer mobile teams',
  ],

  sections: [
    {
      heading: 'What this archetype actually does',
      body: `
Senior-IC mobile in 2026:

— **Platform-specific UI fluency.** SwiftUI on iOS, Jetpack Compose on Android — modern declarative APIs, not just storyboards / XML. Knowing when to drop down to UIKit / View System for the 5% of cases declarative can't handle.

— **Build pipeline ownership.** Fastlane / Xcode Cloud / Bitrise / GitHub Actions for iOS. Gradle + Android Gradle Plugin for Android. You've owned a flaky build that blocked release for a day and you fixed it.

— **App Store / Play Store ops.** Submission, review process, rejections recovery. Phased rollouts. Crashlytics / Bugsnag dashboards you actually check daily during a release window.

— **Perf + battery + memory.** Instruments / Android Profiler depth. Frame drops at 60Hz / 120Hz. Memory leak debugging across retain cycles + lifecycle events. Battery drain from unbounded background work.

— **State management at scale.** Per-platform: ObservableObject + @State + Combine on iOS, ViewModel + StateFlow on Android. Cross-platform: Redux Toolkit / Zustand / Jotai variants. You can articulate trade-offs.

— **Networking and offline.** REST + GraphQL clients with proper retry, request coalescing, response caching. Offline-first patterns. Optimistic UI. Conflict resolution when sync resumes.

— **Accessibility on platform.** VoiceOver on iOS, TalkBack on Android. Dynamic type. Reduced motion. RTL support. The bar at engineering-led product companies (Linear, Spotify) is real.

— **Native module bridges (cross-platform).** When working in RN / Flutter, you've written native modules in Objective-C++ / Swift / Kotlin to bridge platform APIs the framework didn't cover. You've debugged a memory issue across the bridge.

If you've shipped 4-5 of these on at least one platform, you're at the senior-IC bar. Cross-platform candidates need to show comfort dropping into native when needed.
      `.trim(),
    },
    {
      heading: 'Why now (the 2026 mobile market)',
      body: `
Three trends shape 2026 mobile hiring:

— **Native renaissance for premium-experience companies.** Apple's annual platform release cycle (SwiftUI improvements, Swift 6 concurrency hardening, new Liquid Glass UI direction) keeps native capability ahead of cross-platform alternatives. Companies that depend on mobile feel-and-finish (fintech, design tools, premium consumer) hire native-first in 2026.

— **Cross-platform consolidation.** React Native at Meta-scale + Microsoft Teams demonstrated cross-platform can ship at premium quality with serious investment. Flutter retains a strong niche at multi-platform-from-day-1 startups. The cross-platform pool is larger but premium employers screen rigorously for the candidates who can drop into native when needed.

— **AI-tooling productivity gains.** Like web frontend, AI tooling compresses the bottom-60% of mobile work (UI scaffolding, simple state management). The senior-IC bar shifts to platform-specific depth (build pipelines, perf debugging, native-bridge work) where AI tooling provides minimal leverage.

If you're a strong web frontend looking to pivot to mobile, the cross-platform path (RN/Flutter) is approachable in 9-12 months. The native path is 18-24 months minimum to senior-IC bar.
      `.trim(),
    },
    {
      heading: 'How to position your resume',
      body: `
Mobile resumes get rejected most often on Block C ("operational specificity") because most bullets read as feature deliveries: "Built X feature using SwiftUI." Below-4.0 patterns:

— **No DAU / installs / app-store metrics** — mobile work without scale numbers (10k+ DAU minimum, ideally 100k+) reads as side-project work.
— **No crash rate / ANR rate** — claims of "stable app" without data are noise. Senior IC bar: you know your app's crash-free user rate and have moved it.
— **No perf numbers** — frame rate at 60Hz / 120Hz, scroll perf, app launch time, screen-load time. Without these, "performant app" is empty.
— **No platform-specific work for native candidates** — if your bullets read "shipped feature in React Native," you're applying for native roles in cross-platform candidate clothing. Reframe the platform you actually targeted.

Rewrite to surface:

— **Numbers that imply scale.** "Reduced cold-start time on iOS from 2.4s to 0.9s on iPhone 12+ devices, used by 60k DAU."
— **Trade-offs explicitly named.** "Migrated networking from URLSession to Apollo iOS to support GraphQL persisted queries; accepted 200KB binary-size increase for 40% bandwidth reduction at p95."
— **Failure modes you owned.** "Diagnosed memory leak from un-cancelled Combine subscriptions in detail-view; designed cancelable-by-default extension that prevented the regression class across 30+ subscriptions."
— **App-store ops experience.** "Owned the iOS submission cycle for 14 releases; recovered 3 rejections within 24h via expedited review."

Lakshya's archetype detector classifies mobile JDs even when they mention "iOS" or "Android" generically. Run yours through /evaluate to see how it's being classified.
      `.trim(),
    },
  ],

  interviewLoop: [
    {
      stage: 'Recruiter screen',
      format: '20-30 min phone',
      signal: 'Logistics + comp + visa + platform (iOS / Android / cross-platform)',
      prep: 'Platform-specific summary: "I shipped X on iOS / Android, used by Y users at Z scale."',
    },
    {
      stage: 'Hiring manager call',
      format: '45-60 min',
      signal: 'Can you talk about mobile with depth — perf, app-store ops, platform APIs? Have you survived a release cycle?',
      prep: '2 stories: a perf or crash-rate win, an app-store rejection recovery. Numbers + before/after.',
    },
    {
      stage: 'Coding — practical',
      format: '60-90 min, often pair-programming',
      signal: 'Platform-quality code under pressure. Memory management, lifecycle, threading.',
      prep: 'Practice 4 problem types (per platform): (1) implement a paginated list with image loading + recycling, (2) build a search with debounce + cancel + persisted-state, (3) write a coordinator/router pattern for deep-linking, (4) implement an offline-first queue with conflict resolution.',
    },
    {
      stage: 'System design — mobile specific',
      format: '60-90 min',
      signal: 'Can you architect a feature end-to-end? Networking, state, storage, sync, push notifications, analytics, app-store rollout?',
      prep: 'Pre-draft 4 systems: (1) Spotify-style offline music with sync, (2) chat with read receipts + typing indicators, (3) Stripe-payment-flow-on-mobile, (4) social feed with infinite scroll + cache + pull-to-refresh.',
    },
    {
      stage: 'Platform deep-dive',
      format: '60 min',
      signal: 'Platform-specific mastery — iOS: Swift concurrency, Combine, structured concurrency, actors. Android: coroutines, StateFlow, scope management.',
      prep: 'Be ready to: explain when to use Task.detached vs Task, demonstrate proper actor isolation, walk through a structured-concurrency cancellation graph. For Android: explain when to use viewModelScope vs lifecycleScope, demonstrate proper StateFlow .stateIn() usage.',
    },
    {
      stage: 'Behavioral / values',
      format: '45 min',
      signal: 'Cross-functional with product + design + backend. App-store rejection stress. On-call ownership.',
      prep: '4 STAR+R stories — design partnership, app-store rejection you recovered from, on-call rotation insight, mentorship.',
    },
  ],

  skills: [
    {
      category: 'Required (native iOS)',
      skills: ['Swift 5.9+ — concurrency, actors, async/await', 'SwiftUI + UIKit interop', 'Combine + structured concurrency', 'Xcode + Instruments + LLDB', 'XCTest + XCUITest', 'App Store Connect / TestFlight ops', 'Build pipeline (Fastlane / Xcode Cloud)'],
    },
    {
      category: 'Required (native Android)',
      skills: ['Kotlin 1.9+ — coroutines, Flow, structured concurrency', 'Jetpack Compose + Material 3', 'ViewModel + Hilt + Room', 'Android Studio Profiler + tracing', 'Gradle + AGP 8+', 'Play Console ops', 'Build pipeline (Bitrise / GitHub Actions)'],
    },
    {
      category: 'Required (cross-platform)',
      skills: ['React Native: Hermes runtime, Metro, native module bridges', 'OR Flutter: Dart 3+, FFI, platform-channel work', 'Both platforms\' app-store ops', 'Native debugging in Xcode + Android Studio when bridge breaks', 'Reanimated / Worklets for RN; Flutter animation framework'],
    },
    {
      category: 'Preferred',
      skills: ['Multi-module Gradle / SwiftPM modularization', 'Mobile observability (Firebase Crashlytics, Sentry, Datadog Mobile)', 'CI/CD with simulator/device farms (BrowserStack, Sauce Labs, Firebase Test Lab)', 'Mobile a11y depth (VoiceOver, TalkBack, dynamic type, RTL)', 'Localization at scale (15+ locales)'],
    },
    {
      category: 'Bonus',
      skills: ['Open-source contributions to platform tooling (Swift Server Workgroup, Jetpack libs, RN core)', 'Conference talks at WWDC / Droidcon / React Native EU', 'Native module published to npm / Pub', 'Apple Design Award or Google Play Best-of nominee', 'WatchOS / Wear OS / tvOS / Auto experience'],
    },
  ],

  salaryBands: [
    { region: 'US (SF / NY)',     iC: '$170-260k',  staff: '$260-420k',  principal: '$420-700k+', source: 'levels.fyi 2026Q1, Apple / Stripe / Cash App native bands' },
    { region: 'US (Remote)',      iC: '$150-220k',  staff: '$220-340k',  principal: '$340-540k',  source: 'levels.fyi geo-adjusted mobile' },
    { region: 'India (metro)',    iC: '₹30-55 LPA', staff: '₹55-110 LPA', principal: '₹110-220 LPA', source: 'levels.fyi India + Cred / Slice / Razorpay mobile' },
    { region: 'Europe (London)',  iC: '£80-130k',   staff: '£130-200k',  principal: '£200-320k',  source: 'levels.fyi UK + Spotify London / Stripe London' },
    { region: 'Europe (Berlin)',  iC: '€75-120k',   staff: '€120-180k',  principal: '€180-280k',  source: 'kununu + N26 / Tier mobile' },
  ],

  rejectionPatterns: [
    {
      pattern: '"Cross-platform candidate for native role"',
      why: 'JD says iOS / Android specifically; resume reads as React Native / Flutter generalist. Hiring manager fears the candidate will pull cross-platform abstractions into a native codebase.',
      recovery: 'Apply to cross-platform-friendly companies (Shopify, Microsoft, Coinbase) OR demonstrate native depth on a side project. If you genuinely don\'t have native depth, target cross-platform roles, not native ones.',
    },
    {
      pattern: '"No app-store ops"',
      why: 'Resume features mobile development but no submission / review / phased-rollout / rejection-recovery work. Reads as developer never trusted with a release.',
      recovery: 'Add 1-2 bullets per role on app-store work: number of releases shipped, rollout discipline (staged %), expedited reviews leveraged, post-release crash monitoring routines.',
    },
    {
      pattern: '"No crash-rate or perf metrics"',
      why: 'Senior+ mobile candidate can\'t articulate their app\'s crash-free user rate, frame-drop budget, or cold-start time. In 2026 this is a hard senior bar.',
      recovery: 'Pull metrics from Crashlytics / Sentry / Datadog. Add 1 bullet per role with crash-free user rate baseline + your impact. If you genuinely don\'t have this data, target a smaller-scale company first.',
    },
    {
      pattern: '"Title-grade gap"',
      why: 'Senior or Staff title at a smaller shop, but the apps shipped are non-trivial-feature-set in clothing. App-store reviews thin, no high-DAU evidence.',
      recovery: 'Surface DAU + install + review data. Be honest about scope. A smaller-app Senior IC is fine; pretending it\'s Staff at a different scale ages poorly in the loop.',
    },
  ],

  faq: [
    {
      q: 'Native iOS / Android vs cross-platform — which to bet on?',
      a: 'For senior-IC depth in 2026: native pays better and has stronger career-ladder prospects at premium-experience companies. Cross-platform has wider company coverage (RN/Flutter shops are everywhere) but lower compensation ceiling. Pick based on whether you optimize for ceiling or breadth.',
    },
    {
      q: 'How important is Swift / Kotlin concurrency depth in 2026?',
      a: 'Critical for senior-IC. Swift 6 strict concurrency + Kotlin coroutines structured concurrency are heavily probed in platform deep-dives. Candidates who can\'t articulate actor isolation or structured cancellation are pattern-matched to mid-IC even with strong other skills.',
    },
    {
      q: 'Will agents replace mobile engineers?',
      a: 'Compresses bottom-60% (UI scaffolding, simple navigation, basic state). Doesn\'t touch top-40% (perf debugging, platform-specific bug hunts, app-store ops, native bridges). Senior IC mobile gets more leveraged, not less.',
    },
    {
      q: 'Should I learn the new Liquid Glass UI direction in iOS?',
      a: 'For new-product roles at premium shops — yes. For maintenance / B2B mobile — not yet. Apple\'s adoption curve is real but it takes 12-18 months for the bar to shift broadly. Front-foot it if you target Apple-design-award-style companies.',
    },
    {
      q: 'Frontend → mobile — is that the right path?',
      a: 'Cross-platform RN is the smoothest pivot (you already know React + JS). Native iOS / Android is a 12-18 month investment but pays off significantly. Be honest about which you\'re targeting; don\'t apply to native roles after 6 months of RN learning.',
    },
    {
      q: 'How does Lakshya help specifically for this archetype?',
      a: 'Three ways: (1) the archetype detector classifies mobile JDs (iOS / Android / RN / Flutter) cleanly, distinguishing from frontend / fullstack overlap. (2) The CV tailor reframes mobile work into platform-specific operational language. (3) The story bank captures app-store-rejection / crash-debugging / perf-win stories tagged "mobile" — high reuse value because every loop probes them.',
    },
  ],
}
