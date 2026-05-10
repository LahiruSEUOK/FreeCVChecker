import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ScoreGauge from '../components/ScoreGauge';
import MissingKeywords from '../components/MissingKeywords';
import RewriteModal from '../components/RewriteModal';
import ShareCard from '../components/ShareCard';
import AdSlot from '../components/ui/AdSlot';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { enhanceResume } from '../api/resumes';
import { useResumeStore } from '../store/resumeStore';
import type { Recommendation, SectionSuggestion, EnhanceResult } from '../types';

function recommendationVariant(field: Recommendation['field']) {
  if (field === 'skills') return 'danger';
  if (field === 'experience') return 'warning';
  return 'info';
}

function scoreBar(value: number, label: string, weight: string) {
  const color =
    value >= 75 ? 'bg-emerald-500' : value >= 50 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div key={label}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{weight} weight</span>
          <span className="text-sm font-semibold text-slate-900">{value}/100</span>
        </div>
      </div>
      <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const navigate = useNavigate();
  useParams<{ resumeId: string }>();
  const { score, parsedData, fileName } = useResumeStore();
  const [selectedBullet, setSelectedBullet] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'enhance' | 'bullets' | 'share'>('overview');
  const [enhanceResult, setEnhanceResult] = useState<EnhanceResult | null>(null);
  const [enhancing, setEnhancing] = useState(false);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [showEnhanceModal, setShowEnhanceModal] = useState(false);

  const { resumeId, jobDescription } = useResumeStore();

  async function handleEnhance() {
    if (!resumeId || enhanceResult) return;
    setEnhancing(true);
    setEnhanceError(null);
    try {
      const res = await enhanceResume(resumeId, jobDescription);
      setEnhanceResult(res.data);
    } catch (err) {
      setEnhanceError(err instanceof Error ? err.message : 'Failed to generate suggestions');
    } finally {
      setEnhancing(false);
    }
  }

  async function handleCopy(text: string, idx: number) {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  useEffect(() => {
    if (!score) navigate('/upload');
  }, [score, navigate]);

  useEffect(() => {
    if (!score) return;
    const t = setTimeout(() => setShowEnhanceModal(true), 1500);
    return () => clearTimeout(t);
  }, [score]);

  if (!score) return null;

  const { breakdown, missingKeywords, recommendations } = score;

  const allBullets = parsedData?.experience.flatMap((exp) =>
    exp.bullets.map((b) => ({ bullet: b, company: exp.company, title: exp.title })),
  ) ?? [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white text-sm font-bold">F</div>
            <span className="text-lg font-bold text-slate-900">FresherCV</span>
          </a>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => navigate('/upload')}>
              Analyze Another
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 pb-24 space-y-6 animate-fade-in">
        {/* Top ad */}
        <AdSlot slot="banner" />

        {/* Score hero */}
        <div className="card text-center">
          <p className="text-sm text-slate-500 mb-1">
            {fileName && <span className="font-medium text-slate-700">{fileName} · </span>}
            ATS Compatibility Score
          </p>
          <ScoreGauge score={score.score} size={220} />
          <p className="mt-3 text-sm text-slate-500">
            {score.score >= 75
              ? 'Your resume is well-optimised for this job. Great work!'
              : score.score >= 50
              ? 'Your resume partially matches. Follow recommendations below to improve.'
              : 'Your resume needs significant improvements to pass ATS filters.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 gap-1 overflow-x-auto">
          {(['overview', 'enhance', 'bullets', 'share'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); if (tab === 'enhance') handleEnhance(); }}
              className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'border-b-2 border-brand-600 text-brand-700 bg-white'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'overview' ? 'Score Breakdown' : tab === 'enhance' ? '✨ Enhance CV' : tab === 'bullets' ? 'Rewrite Bullets' : 'Share & Export'}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-6 animate-slide-up">
            {/* Score breakdown */}
            <div className="card space-y-5">
              <h2 className="font-bold text-slate-900">Score Breakdown</h2>
              {scoreBar(breakdown.keywords, 'Keyword Match', '40%')}
              {scoreBar(breakdown.content, 'Content Quality', '30%')}
              {scoreBar(breakdown.structure, 'Structure', '20%')}
              {scoreBar(breakdown.formatting, 'Formatting', '10%')}
            </div>

            {/* Missing keywords */}
            <div className="card space-y-4">
              <h2 className="font-bold text-slate-900">Missing Keywords</h2>
              <MissingKeywords keywords={missingKeywords} />
            </div>

            {/* Recommendations */}
            <div className="card space-y-3 lg:col-span-2">
              <h2 className="font-bold text-slate-900">Recommendations</h2>
              <div className="space-y-3">
                {recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 rounded-xl p-4 ${
                      rec.field === 'skills'
                        ? 'bg-red-50 ring-1 ring-red-100'
                        : rec.field === 'experience'
                        ? 'bg-amber-50 ring-1 ring-amber-100'
                        : 'bg-brand-50 ring-1 ring-brand-100'
                    }`}
                  >
                    <Badge variant={recommendationVariant(rec.field)}>
                      {rec.field}
                    </Badge>
                    <p className="text-sm text-slate-700 flex-1">{rec.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Enhance CV */}
        {activeTab === 'enhance' && (
          <div className="space-y-4 animate-slide-up">
            {enhancing && (
              <div className="card flex flex-col items-center justify-center py-12 gap-4">
                <Spinner size="lg" />
                <p className="text-sm text-slate-500">AI is analysing your CV section by section...</p>
              </div>
            )}

            {enhanceError && (
              <div className="card">
                <p className="text-sm text-red-600">{enhanceError}</p>
              </div>
            )}

            {enhanceResult && !enhancing && (
              <>
                <div className="card flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Estimated score after improvements</p>
                    <p className="text-3xl font-extrabold text-emerald-600">{enhanceResult.estimatedNewScore}<span className="text-lg text-slate-400">/100</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Current score</p>
                    <p className="text-2xl font-bold text-slate-600">{score.score}/100</p>
                  </div>
                </div>

                {enhanceResult.sections.map((s: SectionSuggestion, i: number) => (
                  <div key={i} className="card space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wide text-brand-600 bg-brand-50 px-3 py-1 rounded-full">{s.section}</span>
                    </div>
                    <p className="text-sm text-slate-500 italic">{s.issue}</p>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="rounded-xl bg-red-50 ring-1 ring-red-100 p-4">
                        <p className="text-xs font-semibold text-red-500 mb-2">Current</p>
                        <p className="text-sm text-slate-700">{s.currentContent}</p>
                      </div>
                      <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-100 p-4">
                        <p className="text-xs font-semibold text-emerald-600 mb-2">Improved</p>
                        <p className="text-sm text-slate-700">{s.improvedVersion}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopy(s.improvedVersion, i)}
                      className="w-full rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      {copiedIdx === i ? '✓ Copied!' : 'Copy improved version'}
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Tab: Bullet Rewriter */}
        {activeTab === 'bullets' && (
          <div className="card animate-slide-up">
            <h2 className="font-bold text-slate-900 mb-1">AI Bullet Point Rewriter</h2>
            <p className="text-sm text-slate-500 mb-5">
              Click any bullet point to get 3 AI-rewritten alternatives optimised for ATS.
            </p>
            {allBullets.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                No bullet points detected in your resume experience section.
              </p>
            ) : (
              <div className="space-y-4">
                {parsedData?.experience.map((exp, eIdx) => (
                  <div key={eIdx}>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      {exp.title} @ {exp.company}
                    </p>
                    <ul className="space-y-2">
                      {exp.bullets.map((bullet, bIdx) => (
                        <li
                          key={bIdx}
                          onClick={() => setSelectedBullet(bullet)}
                          className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors group"
                        >
                          <svg className="h-4 w-4 mt-0.5 text-brand-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <p className="text-sm text-slate-700 flex-1">{bullet}</p>
                          <span className="text-xs text-brand-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            Rewrite →
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Share */}
        {activeTab === 'share' && (
          <div className="space-y-6 animate-slide-up">
            <ShareCard score={score.score} />

            <div className="card">
              <h2 className="font-bold text-slate-900 mb-3">Download Options</h2>
              <p className="text-sm text-slate-500 mb-4">
                Export your score report to include in job applications.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" size="sm" disabled>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  PDF Report (coming soon)
                </Button>
              </div>
            </div>

            <AdSlot slot="sidebar" />
          </div>
        )}

        {/* Bottom ad */}
        <AdSlot slot="inline" />
      </main>

      {/* Rewrite Modal */}
      {selectedBullet && (
        <RewriteModal
          bulletPoint={selectedBullet}
          onClose={() => setSelectedBullet(null)}
        />
      )}

      {/* Enhance CTA Modal */}
      {showEnhanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl animate-slide-up overflow-hidden">
            <div className="bg-gradient-to-br from-brand-600 to-violet-600 px-6 py-8 text-center text-white">
              <p className="text-5xl font-extrabold mb-1">{score.score}<span className="text-2xl opacity-70">/100</span></p>
              <p className="text-sm opacity-80 mt-1">Your current ATS score</p>
            </div>
            <div className="px-6 py-6 text-center space-y-4">
              <div>
                <p className="text-lg font-bold text-slate-900">Want to score higher?</p>
                <p className="text-sm text-slate-500 mt-1">
                  Our AI can analyse each section of your CV and show you exactly what to improve to pass more ATS filters.
                </p>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  setShowEnhanceModal(false);
                  setActiveTab('enhance');
                  handleEnhance();
                }}
              >
                See AI Suggestions
              </Button>
              <button
                onClick={() => setShowEnhanceModal(false)}
                className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Enhance CTA */}
      {activeTab !== 'enhance' && (
        <div className="sticky bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3">
          <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">Score {score.score}/100 — want to do better?</p>
              <p className="text-xs text-slate-500">AI will show you exactly what to fix, section by section</p>
            </div>
            <button
              onClick={() => { setActiveTab('enhance'); handleEnhance(); }}
              className="flex-shrink-0 flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:opacity-90 transition-opacity w-full sm:w-auto justify-center"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Enhance My CV with AI
            </button>
          </div>
        </div>
      )}

      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        © 2025 FresherCV · Free forever · No login required · Powered by Groq AI
      </footer>
    </div>
  );
}
