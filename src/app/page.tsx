import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Formby — AI Form Builder',
  description: 'Describe your form in plain English. Formby generates the right fields, in the right order, in seconds. Embed anywhere with one line of code.',
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-border px-6 py-3 flex items-center justify-between">
        <span className="text-lg font-bold text-brand">Formby</span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-ink-2 hover:text-ink px-3 py-1.5 transition-colors">Log in</Link>
          <Link href="/signup" className="text-sm font-medium bg-brand text-white rounded-lg px-4 py-1.5 hover:bg-brand-dark transition-colors">Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div>
          <span className="inline-block rounded-full bg-brand-light text-brand text-xs font-medium px-3 py-1 mb-4">Powered by Claude AI</span>
          <h1 className="text-5xl font-bold text-ink leading-tight mb-4">
            Describe it.<br />
            <span className="text-brand">Formby</span> builds it.
          </h1>
          <p className="text-lg text-ink-2 mb-8 leading-relaxed max-w-md">
            Stop wrestling with form builders. Type what you need in plain English — Formby generates the right fields, the right types, and the right order. In seconds.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/signup" className="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark transition-colors shadow-sm">
              Start building free →
            </Link>
            <Link href="/demo" className="rounded-lg border border-border px-6 py-3 text-sm font-medium text-ink-2 hover:bg-surface transition-colors">
              Try demo · no signup
            </Link>
          </div>
          <p className="mt-3 text-xs text-ink-muted">3 free generations · No credit card · Or bring your own Anthropic key</p>
        </div>

        <div className="flex flex-col gap-3">
          {/* Prompt card */}
          <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
            <div className="text-xs text-ink-muted mb-2 font-semibold uppercase tracking-wide">Describe your form</div>
            <p className="text-sm text-ink leading-relaxed">
              A job application with name, email, years of experience, a skills multi-select, preferred work location, and a cover letter.
            </p>
            <div className="mt-3 flex justify-end" aria-hidden="true">
              <div className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white">Generate Form →</div>
            </div>
          </div>

          {/* Arrow */}
          <div className="text-center text-2xl text-brand">↓</div>

          {/* Generated form preview */}
          <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
            <div className="text-xs text-ink-muted mb-3 font-semibold uppercase tracking-wide">Generated instantly</div>
            <div className="flex flex-col gap-2.5">
              <div>
                <div className="text-xs font-medium text-ink-2 mb-1">Full Name <span className="text-red-500">*</span></div>
                <div className="rounded border border-border bg-surface h-7 text-xs text-ink-muted px-2 flex items-center">e.g. Jane Smith</div>
              </div>
              <div>
                <div className="text-xs font-medium text-ink-2 mb-1">Email Address <span className="text-red-500">*</span></div>
                <div className="rounded border border-border bg-surface h-7 text-xs text-ink-muted px-2 flex items-center">e.g. jane@company.com</div>
              </div>
              <div>
                <div className="text-xs font-medium text-ink-2 mb-1">Years of Experience <span className="text-red-500">*</span></div>
                <div className="rounded border border-border bg-surface h-7 text-xs text-ink-muted px-2 flex items-center">e.g. 5</div>
              </div>
              <div className="text-xs text-ink-muted italic">+ 3 more fields generated…</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-surface border-t border-border px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-ink text-center mb-3">
            From idea to live form in three steps
          </h2>
          <p className="text-ink-2 text-center mb-12 max-w-xl mx-auto">
            No tutorials. No drag-and-drop marathons. Just describe what you need and go.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-3">
              <div className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center text-sm font-bold shrink-0">1</div>
              <h3 className="text-lg font-semibold text-ink">Describe your form</h3>
              <p className="text-ink-2 text-sm leading-relaxed">
                Type what you need in plain English. &ldquo;A contact form with name, email, and a message.&rdquo; That&apos;s it — Formby handles the rest.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center text-sm font-bold shrink-0">2</div>
              <h3 className="text-lg font-semibold text-ink">Edit and preview</h3>
              <p className="text-ink-2 text-sm leading-relaxed">
                Drag to reorder. Change field types. Add options. A live preview updates in real time so you see exactly what your users will see.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center text-sm font-bold shrink-0">3</div>
              <h3 className="text-lg font-semibold text-ink">Publish and embed</h3>
              <p className="text-ink-2 text-sm leading-relaxed">
                One line of code. Paste it into any website, CMS, or app. Submissions land in your dashboard instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-ink text-center mb-12">Everything you need. Nothing you don&apos;t.</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">

          <div className="flex flex-col gap-3 rounded-xl border border-border p-6">
            <div className="text-2xl">✦</div>
            <h3 className="text-base font-semibold text-ink">AI that gets it right</h3>
            <p className="text-sm text-ink-2 leading-relaxed">
              Formby uses Claude to generate correct field types, sensible ordering, and real labels — not generic placeholders. You&apos;ll rarely need to fix anything.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-border p-6">
            <div className="text-2xl">📥</div>
            <h3 className="text-base font-semibold text-ink">Submissions dashboard</h3>
            <p className="text-sm text-ink-2 leading-relaxed">
              Every response is captured and stored. Sort by date, read individual entries, and export everything to CSV in one click.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-border p-6">
            <div className="text-2xl">🔗</div>
            <h3 className="text-base font-semibold text-ink">Webhook delivery</h3>
            <p className="text-sm text-ink-2 leading-relaxed">
              Route submissions to Zapier, Slack, Notion, or your own endpoint automatically. Set a URL and forget it.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-border p-6">
            <div className="text-2xl">&lt;/&gt;</div>
            <h3 className="text-base font-semibold text-ink">Embed anywhere</h3>
            <p className="text-sm text-ink-2 leading-relaxed">
              iframe or script tag — your choice. Works on Squarespace, WordPress, Webflow, and raw HTML. No platform lock-in.
            </p>
          </div>

        </div>
      </section>

      {/* Closing CTA band */}
      <section className="bg-brand px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stop building forms by hand.
          </h2>
          <p className="text-brand-light text-lg mb-8">
            Create your first AI-generated form in 30 seconds. Free, forever.
          </p>
          <Link href="/signup" className="inline-block rounded-lg bg-white text-brand px-8 py-3 text-sm font-bold hover:bg-brand-light transition-colors shadow-sm">
            Get started — it&apos;s free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6 text-center text-xs text-ink-muted">
        <span className="font-semibold text-brand">Formby</span> — AI-powered form builder
      </footer>

    </div>
  )
}
