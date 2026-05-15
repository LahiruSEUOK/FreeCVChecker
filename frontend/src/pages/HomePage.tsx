import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import AdSlot from '../components/ui/AdSlot';

const FEATURES = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: 'from-emerald-500 to-teal-500',
    title: 'ATS Score (0–100)',
    desc: 'Get a detailed compatibility score against any job description.',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    gradient: 'from-brand-500 to-violet-500',
    title: 'AI Bullet Rewriter',
    desc: 'Instantly upgrade weak bullet points with 3 AI-powered alternatives.',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    gradient: 'from-amber-500 to-orange-500',
    title: 'Missing Keywords',
    desc: 'See exactly which skills are missing from your resume.',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    gradient: 'from-slate-500 to-slate-600',
    title: '100% Free & Private',
    desc: 'No login required. Your data stays yours.',
  },
];

const STEPS = [
  {
    num: '01',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
    title: 'Upload Resume',
    desc: 'PDF or DOCX, up to 5MB',
  },
  {
    num: '02',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Paste Job Description',
    desc: 'The role you are applying for',
  },
  {
    num: '03',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Get Your ATS Score',
    desc: 'AI-powered analysis in seconds',
  },
  {
    num: '04',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    title: 'Improve & Apply',
    desc: 'Fix weak spots and get more interviews',
  },
];

const TRUST_BADGES = [
  {
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    label: 'No Login Required',
  },
  {
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: 'Free Forever',
  },
  {
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: 'Results in 60s',
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Nav */}
      <header className="sticky top-0 z-40 glass-nav">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-5 sm:py-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-violet-600 text-white text-xs font-bold shadow-soft">
              F
            </div>
            <span className="text-sm sm:text-base font-bold text-slate-950 tracking-tight">FresherCV</span>
            <span className="hidden sm:inline ml-1 badge bg-brand-50 text-brand-700 ring-1 ring-brand-200/60 text-xs font-semibold">Free</span>
          </div>
          <Button onClick={() => navigate('/upload')} size="sm" className="shadow-soft whitespace-nowrap text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2">
            <span className="hidden sm:inline">Check My Resume</span>
            <span className="sm:hidden">Get Started</span>
          </Button>
        </div>
      </header>

      {/* Top banner ad — hidden on mobile */}
      <div className="hidden sm:block mx-auto w-full max-w-6xl px-5 pt-4">
        <AdSlot slot="banner" />
      </div>

      {/* Hero */}
      <section className="bg-hero dot-pattern relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-brand-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-60 h-60 sm:w-80 sm:h-80 bg-violet-600/15 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-5 py-10 sm:py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Copy */}
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-medium text-slate-300 mb-4 sm:mb-5 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Powered by Groq AI
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white mb-3 sm:mb-5 leading-[1.1] tracking-tight">
                Land More Interviews.{' '}
                <span className="bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">
                  Beat the ATS.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-400 max-w-lg mb-5 sm:mb-7 leading-relaxed">
                Free AI-powered resume scanner. Upload your resume, paste a job description, get your ATS score in seconds.
              </p>

              <div className="flex flex-col sm:flex-row gap-2.5 mb-5 sm:mb-7">
                <Button
                  size="sm"
                  onClick={() => navigate('/upload')}
                  className="sm:!text-sm sm:!px-5 sm:!py-2.5 bg-gradient-to-r from-brand-500 to-violet-600 hover:from-brand-600 hover:to-violet-700 shadow-glow"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Check My Resume — Free
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/upload')}
                  className="sm:!text-sm sm:!px-5 sm:!py-2.5 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  See a Sample Score
                </Button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-3">
                {TRUST_BADGES.map((b) => (
                  <div key={b.label} className="flex items-center gap-1 text-slate-400 text-xs">
                    <span className="text-brand-400 [&>svg]:h-3 [&>svg]:w-3">{b.icon}</span>
                    {b.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Mock Score Preview Card — desktop only */}
            <div className="hidden lg:flex justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <div className="w-80 rounded-2xl bg-white/[0.07] border border-white/[0.12] backdrop-blur-md shadow-float p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">ATS Compatibility</p>
                    <p className="text-sm text-slate-300 mt-0.5">software-engineer-resume.pdf</p>
                  </div>
                  <span className="badge bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30 text-xs font-semibold">Competitive</span>
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-6xl font-extrabold text-white leading-none">78</span>
                  <div className="pb-1">
                    <span className="text-2xl text-slate-500 font-light">/100</span>
                    <p className="text-xs text-amber-400 font-medium mt-0.5">+22 pts to Strong Match</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Keyword Match', value: 72, color: 'bg-amber-400', weight: '40%' },
                    { label: 'Content Quality', value: 85, color: 'bg-emerald-400', weight: '30%' },
                    { label: 'Structure', value: 80, color: 'bg-emerald-400', weight: '20%' },
                    { label: 'Formatting', value: 70, color: 'bg-amber-400', weight: '10%' },
                  ].map((m) => (
                    <div key={m.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-slate-400 font-medium">{m.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">{m.weight}</span>
                          <span className="text-xs text-white font-semibold">{m.value}</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                        <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-2 font-medium">Missing Keywords</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['TypeScript', 'Docker', 'CI/CD', 'AWS'].map((kw) => (
                      <span key={kw} className="badge bg-red-500/15 text-red-300 ring-1 ring-red-500/25 text-xs">{kw}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl bg-gradient-to-r from-brand-600/40 to-violet-600/40 border border-brand-500/30 px-4 py-3 text-center">
                  <p className="text-xs text-brand-200 font-medium">Get your real score in 60 seconds</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-5">
          <div className="flex items-center justify-center divide-x divide-slate-200 py-3">
            {[
              { value: '20+', label: 'ATS Checks' },
              { value: 'Instant', label: 'Results' },
              { value: '100%', label: 'Free' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-1.5 px-4 sm:px-8">
                <span className="text-sm sm:text-base font-extrabold text-brand-600">{stat.value}</span>
                <span className="text-xs sm:text-sm font-medium text-slate-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <section className="bg-white py-10 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-5">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-950 tracking-tight mb-2">
              Everything You Need to Get Shortlisted
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              Our AI analyses your resume against the job description across multiple dimensions.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="card-hover text-center group p-4 sm:p-6">
                <div className={`flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} text-white mx-auto mb-3 shadow-soft [&>svg]:h-4 [&>svg]:w-4 sm:[&>svg]:h-5 sm:[&>svg]:w-5`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900 mb-1 text-xs sm:text-sm">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed hidden sm:block">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-10 sm:py-16 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-5">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-950 tracking-tight mb-2">How It Works</h2>
            <p className="text-sm text-slate-500">Four simple steps from upload to optimisation.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {STEPS.map((s, i) => (
              <div key={s.num} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-gradient-to-r from-brand-200 to-slate-200 z-0" />
                )}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-white shadow-card ring-1 ring-slate-100 text-brand-600 mb-3 [&>svg]:h-5 [&>svg]:w-5 sm:[&>svg]:h-6 sm:[&>svg]:w-6">
                    {s.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-500 mb-0.5">{s.num}</span>
                  <h3 className="font-semibold text-slate-900 mb-0.5 text-xs sm:text-sm">{s.title}</h3>
                  <p className="text-xs text-slate-500 hidden sm:block">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inline ad — hidden on mobile */}
      <div className="hidden sm:block mx-auto w-full max-w-6xl px-5 pb-4">
        <AdSlot slot="inline" />
      </div>

      {/* CTA banner */}
      <section className="relative overflow-hidden bg-hero dot-pattern py-10 sm:py-16 text-white text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 sm:w-[600px] sm:h-[300px] bg-brand-600/20 rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-2xl px-4 sm:px-5">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold mb-2 sm:mb-3 tracking-tight">
            Ready to Land Your Next Job?
          </h2>
          <p className="text-slate-400 mb-5 sm:mb-7 text-sm sm:text-base">
            See exactly why your resume gets rejected — and fix it in minutes.
          </p>
          <Button
            size="sm"
            onClick={() => navigate('/upload')}
            className="sm:!text-sm sm:!px-6 sm:!py-3 bg-white text-brand-700 hover:bg-slate-100 shadow-float"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Check My Resume — It's Free
          </Button>
          <p className="mt-3 text-xs text-slate-500">PDF & DOCX · No login · 60 seconds</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-400">
        <p>© 2025 FresherCV · Free forever · No login required · Powered by Groq AI</p>
      </footer>
    </div>
  );
}
