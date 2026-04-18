import type { Metadata } from 'next';

const GUMROAD_URL = 'https://gumroad.com/l/ukmla-haem';
const CANONICAL = 'https://ukmladaily.co.uk/packs/haematology';

const TITLE = 'UKMLA Haematology Revision Pack · UKMLA Daily';
const DESCRIPTION =
  '29 Notion pages, 281 Anki cards, one consistent revision base for UKMLA haematology. £18. Built by a UCL medical student.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    type: 'website',
    siteName: 'UKMLA Daily',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

const CATEGORIES: { label: string; count: number; topics: string[] }[] = [
  {
    label: 'Anaemias',
    count: 6,
    topics: [
      'Iron Deficiency Anaemia',
      'Anaemia of Chronic Disease',
      'Macrocytic Anaemia',
      'Sickle Cell Disease',
      'Thalassaemia (inc. Alpha & Beta)',
      'G6PD Deficiency',
    ],
  },
  { label: 'Leukaemias', count: 4, topics: ['AML', 'ALL', 'CML', 'CLL'] },
  { label: 'Lymphomas', count: 2, topics: ['Hodgkin Lymphoma', "Non-Hodgkin's Lymphoma"] },
  {
    label: 'Plasma cell & myeloproliferative',
    count: 5,
    topics: [
      'Multiple Myeloma',
      'Polycythaemia Vera',
      'Essential Thrombocythaemia',
      'Myelofibrosis',
      'Myelodysplastic Syndrome',
    ],
  },
  {
    label: 'Bleeding & platelet disorders',
    count: 4,
    topics: ['Haemophilia A & B', 'Von Willebrand Disease', 'ITP', 'TTP'],
  },
  { label: 'Thromboembolic', count: 3, topics: ['DVT', 'PE', 'Thrombophilia'] },
  { label: 'Other', count: 2, topics: ['Tumour Lysis Syndrome', 'Hereditary Haemochromatosis'] },
];

const REASONS: { title: string; body: string }[] = [
  {
    title: 'Consistency',
    body: 'Every topic looks the same. No switching between 5 formats.',
  },
  {
    title: 'Density',
    body: 'No fluff. Every bullet earns its place.',
  },
  {
    title: 'UK-specific',
    body: 'NICE guidelines, BNF drug doses, British English throughout.',
  },
  {
    title: 'Active recall built in',
    body: 'Q&A toggles on every page, Anki cards ready to go.',
  },
  {
    title: 'Original mnemonics',
    body: 'Not recycled from Geeky Medics or Zero to Finals.',
  },
];

const DELIVERABLES: { emoji: string; title: string; body: string }[] = [
  { emoji: '🗂️', title: '29 Notion pages', body: 'Duplicatable template, free Notion account works.' },
  { emoji: '🎴', title: '281 Anki cards', body: 'Tab-separated .txt, hierarchical tags.' },
  { emoji: '📖', title: 'Buyer README', body: 'Workflow recommendations and import instructions.' },
  { emoji: '🔄', title: 'Free updates within v1.x', body: 'Fixes and additions ship to you automatically.' },
];

const FAQS: { q: string; a: string }[] = [
  { q: 'Do I need a Notion subscription?', a: 'No. Free Notion works fine.' },
  { q: 'Can I use this on my phone?', a: 'Yes — Notion has excellent mobile apps.' },
  {
    q: 'What if I find a mistake?',
    a: 'Email me. It gets fixed, and you get the update for free.',
  },
  {
    q: 'Is this a replacement for Passmed or Quesmed?',
    a: 'No. Use this as your revision base and question banks for testing.',
  },
  {
    q: 'Can I share with friends?',
    a: 'The licence is personal use. Please point friends to the Gumroad page if they want a copy.',
  },
];

function PrimaryCTA({ className = '' }: { className?: string }) {
  return (
    <a
      href={GUMROAD_URL}
      className={`inline-flex items-center justify-center bg-accent text-white font-semibold rounded-xl px-7 py-3.5 min-h-[44px] text-[15px] transition-all active:scale-[0.98] hover:-translate-y-px hover:shadow-lg hover:shadow-accent/25 ${className}`}
    >
      Buy on Gumroad <span className="ml-1.5">→</span>
    </a>
  );
}

export default function HaematologyPackPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      {/* Section 1 — Hero */}
      <section className="bg-paper pt-24 sm:pt-32 pb-16 sm:pb-24">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <p className="text-[13px] font-bold tracking-[3px] uppercase text-accent mb-5">
            UKMLA Daily · Pack
          </p>
          <h1 className="font-serif-display text-[clamp(2.5rem,7vw,4.75rem)] leading-[1.05] tracking-[-0.02em] text-ink text-balance mb-6">
            Haematology, finally written the way it should&rsquo;ve been taught.
          </h1>
          <p className="text-[17px] sm:text-[19px] text-ink/70 leading-relaxed max-w-xl mx-auto mb-10">
            29 topics. 281 flashcards. One Notion template. £18.
          </p>
          <PrimaryCTA />
        </div>
      </section>

      {/* Section 2 — The problem */}
      <section className="bg-paper py-14 sm:py-20 border-t border-black/[0.06]">
        <div className="max-w-2xl mx-auto px-5">
          <h2 className="font-serif-display text-[clamp(1.75rem,4vw,2.5rem)] leading-[1.1] text-ink mb-6">
            The problem
          </h2>
          <div className="space-y-5 text-[16px] sm:text-[17px] leading-[1.75] text-ink/80">
            <p>
              Haematology is one of the most conceptually dense topics on UKMLA. And the resource
              that actually helps you learn it doesn&rsquo;t exist.
            </p>
            <p>
              Passmed gives you questions. Zero to Finals gives you outlines. Quesmed gives you
              more questions. None of them give you a single, consistent revision base — one place
              where every topic is written the same way, dense enough to teach you, short enough
              that you can actually finish it.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 — What this is */}
      <section className="bg-paper py-14 sm:py-20 border-t border-black/[0.06]">
        <div className="max-w-2xl mx-auto px-5">
          <h2 className="font-serif-display text-[clamp(1.75rem,4vw,2.5rem)] leading-[1.1] text-ink mb-6">
            What this is
          </h2>
          <div className="space-y-5 text-[16px] sm:text-[17px] leading-[1.75] text-ink/80 mb-8">
            <p>
              A complete UKMLA haematology revision pack. Built by a UCL medical student
              who&rsquo;s sitting the same exam you are.
            </p>
            <p>29 Notion pages. Every topic structured the same way:</p>
          </div>

          <div className="bg-white rounded-2xl border-l-[3px] border-accent shadow-sm shadow-black/[0.03] px-6 py-5 sm:px-7 sm:py-6">
            <p className="text-[15px] sm:text-[16px] leading-[1.75] text-ink">
              Definition → Epidemiology → Pathophysiology → Presentation → Investigations →
              Differentials → Management → Complications → Memory Aids → Active Recall → Exam
              Pearls
            </p>
          </div>

          <p className="mt-8 text-[16px] sm:text-[17px] leading-[1.75] text-ink/80">
            Paired with a 281-card Anki deck that maps to the same content.
          </p>
        </div>
      </section>

      {/* Section 4 — What's in it */}
      <section className="bg-paper py-14 sm:py-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="font-serif-display text-[clamp(1.75rem,4vw,2.5rem)] leading-[1.1] text-ink mb-10">
            What&rsquo;s in it
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.label}
                className="bg-white rounded-2xl border border-black/[0.06] p-5 sm:p-6 shadow-sm shadow-black/[0.02]"
              >
                <p className="text-[11px] font-bold tracking-[2px] uppercase text-accent mb-3">
                  {cat.label} ({cat.count})
                </p>
                <ul className="space-y-2 text-[14px] sm:text-[15px] leading-[1.55] text-ink/85">
                  {cat.topics.map((topic) => (
                    <li key={topic} className="flex gap-2">
                      <span className="text-accent shrink-0" aria-hidden="true">
                        •
                      </span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5 — Why buy this over free resources */}
      <section className="bg-paper py-14 sm:py-20 border-t border-black/[0.06]">
        <div className="max-w-5xl mx-auto px-5">
          <h2 className="font-serif-display text-[clamp(1.75rem,4vw,2.5rem)] leading-[1.1] text-ink mb-10">
            Why this over free resources
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {REASONS.map((r) => (
              <div
                key={r.title}
                className="bg-white rounded-2xl border border-black/[0.06] p-5 sm:p-6 shadow-sm shadow-black/[0.02]"
              >
                <h3 className="text-[15px] font-semibold text-accent mb-2">{r.title}</h3>
                <p className="text-[14px] sm:text-[15px] leading-[1.6] text-ink/80">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6 — What you get (visual) */}
      <section className="bg-paper py-14 sm:py-20 border-t border-black/[0.06]">
        <div className="max-w-5xl mx-auto px-5">
          <h2 className="font-serif-display text-[clamp(1.75rem,4vw,2.5rem)] leading-[1.1] text-ink mb-10">
            What you get
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {DELIVERABLES.map((d) => (
              <div
                key={d.title}
                className="bg-white rounded-2xl border border-black/[0.06] p-5 sm:p-6 shadow-sm shadow-black/[0.02]"
              >
                <div className="text-[28px] mb-3" aria-hidden="true">
                  {d.emoji}
                </div>
                <p className="text-[14px] sm:text-[15px] font-semibold text-ink mb-1.5">
                  {d.title}
                </p>
                <p className="text-[13px] sm:text-[14px] leading-[1.55] text-ink/70">{d.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7 — Pricing */}
      <section className="bg-paper py-16 sm:py-24 border-t border-black/[0.06]">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <h2 className="font-serif-display text-[clamp(1.75rem,4vw,2.5rem)] leading-[1.1] text-ink mb-8">
            Pricing
          </h2>
          <p className="font-serif-display text-[clamp(5rem,15vw,9rem)] leading-none text-ink mb-4">
            £18
          </p>
          <p className="text-[15px] sm:text-[16px] text-ink/70 mb-10">
            One-off. No subscription. Updates free.
          </p>
          <PrimaryCTA />
        </div>
      </section>

      {/* Section 8 — FAQ */}
      <section className="bg-paper py-14 sm:py-20 border-t border-black/[0.06]">
        <div className="max-w-2xl mx-auto px-5">
          <h2 className="font-serif-display text-[clamp(1.75rem,4vw,2.5rem)] leading-[1.1] text-ink mb-8">
            FAQ
          </h2>
          <div className="space-y-3">
            {FAQS.map((item) => (
              <details
                key={item.q}
                className="group bg-white rounded-2xl border border-black/[0.06] shadow-sm shadow-black/[0.02] overflow-hidden"
              >
                <summary className="list-none cursor-pointer select-none px-5 py-4 sm:px-6 sm:py-5 min-h-[44px] flex items-center justify-between gap-4 font-sans font-medium text-[15px] sm:text-[16px] text-ink">
                  <span>{item.q}</span>
                  <span
                    aria-hidden="true"
                    className="text-accent text-[18px] leading-none transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-[14px] sm:text-[15px] leading-[1.65] text-ink/80">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Section 9 — Final CTA */}
      <section className="bg-paper py-20 sm:py-28 border-t border-black/[0.06]">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <h2 className="font-serif-display text-[clamp(2.5rem,6vw,4rem)] leading-[1.05] tracking-[-0.02em] text-ink mb-5">
            Ready?
          </h2>
          <p className="text-[16px] sm:text-[18px] text-ink/70 mb-10">
            29 topics. 281 flashcards. One Notion template. £18.
          </p>
          <PrimaryCTA />
          <div className="h-16 sm:h-24" aria-hidden="true" />
        </div>
      </section>
    </main>
  );
}
