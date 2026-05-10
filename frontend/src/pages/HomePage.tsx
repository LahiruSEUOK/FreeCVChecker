import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import AdSlot from '../components/ui/AdSlot';

const FEATURES = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'ATS Score (0–100)',
    desc: 'Get a detailed compatibility score against any job description.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'AI Bullet Rewriter',
    desc: 'Instantly upgrade weak bullet points with 3 Claude AI alternatives.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    title: 'Missing Keywords',
    desc: 'See exactly which skills are missing from your resume.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: '100% Free & Private',
    desc: 'No login required. We never store your personal data.',
  },
];

const STEPS = [
  { num: '01', title: 'Upload Resume', desc: 'PDF or DOCX, up to 5MB' },
  { num: '02', title: 'Paste Job Description', desc: 'The job you are applying for' },
  { num: '03', title: 'Get Your ATS Score', desc: 'Instant AI-powered analysis' },
  { num: '04', title: 'Fix & Share', desc: 'Rewrite bullets & share results' },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white text-sm font-bold">F</div>
            <span className="text-lg font-bold text-slate-900">FresherCV</span>
            <span className="ml-1 badge bg-brand-100 text-brand-700">Free</span>
          </div>
          <Button onClick={() => navigate('/upload')} size="sm">
            Check My Resume
          </Button>
        </div>
      </header>

      {/* Top banner ad */}
      <div className="mx-auto w-full max-w-6xl px-4 pt-4">
        <AdSlot slot="banner" />
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 mb-6">
          <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
          Powered by Claude AI
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
          Will Your Resume Pass<br />
          <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">
            the ATS Filter?
          </span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-8">
          Free AI-powered resume screener for fresh graduates. Upload your resume, paste a job description, and get your ATS compatibility score in seconds — no login needed.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/upload')}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Check My Resume — Free
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/upload')}>
            See a Sample Score
          </Button>
        </div>
        <p className="text-xs text-slate-400 mt-4">
          Supports PDF & DOCX • 0–2 years experience • Sri Lanka · India · Philippines
        </p>
      </section>

      {/* Features */}
      <section className="bg-white border-y border-slate-100 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-10">
            Everything a Fresher Needs
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card text-center hover:shadow-md transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 mx-auto mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-10">How It Works</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.num} className="relative">
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-slate-200 z-0" />
              )}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 text-white text-xl font-extrabold mb-4 shadow-lg">
                  {s.num}
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{s.title}</h3>
                <p className="text-sm text-slate-500">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Inline ad */}
      <div className="mx-auto w-full max-w-6xl px-4 pb-8">
        <AdSlot slot="inline" />
      </div>

      {/* CTA banner */}
      <section className="bg-gradient-to-r from-brand-600 to-violet-600 py-16 text-white text-center">
        <h2 className="text-3xl font-extrabold mb-4">Ready to Land Your First Job?</h2>
        <p className="text-brand-100 mb-8 max-w-md mx-auto">
          Thousands of freshers have already improved their resumes. Join them for free.
        </p>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => navigate('/upload')}
          className="bg-white text-brand-700 hover:bg-brand-50"
        >
          Check My Resume Now
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-400">
        <p>© 2025 FresherCV · Free forever · No login required · Powered by Claude AI</p>
        <p className="mt-1">Built for fresh graduates in Sri Lanka · India · Philippines</p>
      </footer>
    </div>
  );
}
