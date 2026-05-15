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

function recommendationAccent(field: Recommendation['field']) {
  if (field === 'skills') return 'border-red-400 bg-red-50';
  if (field === 'experience') return 'border-amber-400 bg-amber-50';
  return 'border-brand-400 bg-brand-50';
}

interface MetricCardProps {
  label: string;
  value: number;
  weight: string;
  icon: React.ReactNode;
  iconBg: string;
}

function MetricCard({ label, value, weight, icon, iconBg }: MetricCardProps) {
  const barColor =
    value >= 75 ? 'bg-emerald-500' : value >= 50 ? 'bg-amber-400' : 'bg-red-400';
  const textColor =
    value >= 75 ? 'text-emerald-600' : value >= 50 ? 'text-amber-600' : 'text-red-500';

  return (
    <div className="metric-card group hover:border-slate-200 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg ${iconBg} [&>svg]:h-3.5 [&>svg]:w-3.5 sm:[&>svg]:h-4 sm:[&>svg]:w-4`}>
            {icon}
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800">{label}</p>
            <p className="text-[10px] sm:text-xs text-slate-400">{weight} weight</p>
          </div>
        </div>
        <span className={`text-lg sm:text-xl font-extrabold ${textColor}`}>{value}</span>
      </div>
      <div className="h-1.5 sm:h-2 w-full rounded-full bg-slate-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

const METRIC_ICONS = {
  keywords: (
    <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  content: (
    <svg className="h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  structure: (
    <svg className="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h8M4 18h8" />
    </svg>
  ),
  formatting: (
    <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
};

const TAB_LABELS: Record<string, string> = {
  overview: 'Score Breakdown',
  enhance: '✦ Enhance CV',
  bullets: 'Rewrite Bullets',
  share: 'Share',
};

const TAB_LABELS_MOBILE: Record<string, string> = {
  overview: 'Score',
  enhance: '✦ Enhance',
  bullets: 'Bullets',
  share: 'Share',
};

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
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);

  const { resumeId, jobDescription } = useResumeStore();

  function buildAIPrompt(): string {
    const skills = parsedData?.skills?.join(', ') || 'Not listed';
    const experienceBullets = parsedData?.experience
      ?.flatMap((e) => e.bullets)
      .slice(0, 6)
      .map((b) => `• ${b}`)
      .join('\n') || 'Not listed';
    const missing = score?.missingKeywords?.join(', ') || 'None identified';
    const recs = score?.recommendations
      ?.map((r) => `• [${r.field}] ${r.message}`)
      .join('\n') || '';

    return `I need help rewriting my CV to score higher on ATS (Applicant Tracking System) filters.

MY CURRENT ATS SCORE: ${score?.score ?? 0}/100

━━━ JOB I'M APPLYING FOR ━━━
${jobDescription}

━━━ MY CURRENT CV ━━━
SKILLS: ${skills}

EXPERIENCE:
${experienceBullets}

SUMMARY: ${parsedData?.summary || 'Not provided'}

━━━ WHAT NEEDS TO IMPROVE ━━━
Missing keywords to add naturally: ${missing}

Specific improvement areas:
${recs}

━━━ PLEASE ━━━
1. Rewrite my CV incorporating the missing keywords naturally
2. Strengthen each bullet point with a strong action verb + quantified result
3. Write a compelling 3-line professional summary targeting this job
4. Keep it authentic — I am a fresh graduate
5. Return the full rewritten CV with these sections: Summary, Skills, Experience, Education`;
  }

  async function handleCopyPrompt() {
    await navigator.clipboard.writeText(buildAIPrompt());
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 3000);
  }

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

  const scoreStatusBg =
    score.score >= 75
      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
      : score.score >= 50
      ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
      : 'bg-red-50 text-red-700 ring-1 ring-red-200';

  const scoreStatusDot =
    score.score >= 75 ? 'bg-emerald-500' : score.score >= 50 ? 'bg-amber-500' : 'bg-red-500';

  const scoreStatusLabel =
    score.score >= 75 ? 'Strong Match' : score.score >= 50 ? 'Competitive' : 'Weak Match';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-40 glass-nav">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-5 py-2.5 sm:py-4">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-white text-xs sm:text-sm font-bold shadow-soft">
              F
            </div>
            <span className="text-sm sm:text-lg font-bold text-slate-950 tracking-tight">FresherCV</span>
          </a>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => navigate('/upload')}>
              <span className="hidden sm:inline">Analyse Another</span>
              <span className="sm:hidden">New Scan</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-5xl px-3 sm:px-4 py-4 sm:py-8 pb-24 sm:pb-28 space-y-3 sm:space-y-5 animate-fade-in">
        {/* Top ad */}
        <AdSlot slot="banner" />

        {/* Score hero — split layout */}
        <div className="card !p-4 sm:!p-6">
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 items-center">
            {/* Left: gauge */}
            <div className="flex flex-col items-center">
              <ScoreGauge score={score.score} size={180} />
            </div>

            {/* Right: score info */}
            <div className="space-y-3 sm:space-y-4">
              {fileName && (
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide truncate">{fileName}</p>
              )}

              <div>
                <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-xs font-semibold ${scoreStatusBg}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${scoreStatusDot}`} />
                  {scoreStatusLabel}
                </div>
              </div>

              <div>
                <p className="text-xs sm:text-sm text-slate-500 mb-2">
                  {score.score >= 75
                    ? 'Your resume is well-optimised for this role.'
                    : score.score >= 50
                    ? `${75 - score.score} points away from a Strong Match.`
                    : 'Your resume needs work to pass ATS filters.'}
                </p>

                {/* Progress to 75 bar */}
                {score.score < 75 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Progress to Strong Match (75)</span>
                      <span className="font-semibold text-slate-600">{score.score}/75</span>
                    </div>
                    <div className="h-1.5 sm:h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all duration-1000"
                        style={{ width: `${Math.min(100, (score.score / 75) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowPromptModal(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-violet-700 hover:bg-violet-100 transition-colors"
              >
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z" />
                </svg>
                Generate full CV with AI
              </button>
            </div>
          </div>
        </div>

        {/* Tabs — pill style */}
        <div className="bg-white rounded-2xl shadow-soft ring-1 ring-slate-100/80 p-1 sm:p-1.5 flex gap-0.5 sm:gap-1">
          {(['overview', 'enhance', 'bullets', 'share'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); if (tab === 'enhance') handleEnhance(); }}
              className={`tab-pill flex-1 text-center !text-xs sm:!text-sm !px-2 sm:!px-3 !py-1.5 sm:!py-2 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-soft'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="hidden sm:inline">{TAB_LABELS[tab]}</span>
              <span className="sm:hidden">{TAB_LABELS_MOBILE[tab]}</span>
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-5 animate-fade-in-up">
            {/* Score breakdown */}
            <div className="card space-y-4">
              <h2 className="font-bold text-slate-950 text-base">Score Breakdown</h2>
              <MetricCard
                label="Keyword Match"
                value={breakdown.keywords}
                weight="40%"
                icon={METRIC_ICONS.keywords}
                iconBg="bg-amber-50"
              />
              <MetricCard
                label="Content Quality"
                value={breakdown.content}
                weight="30%"
                icon={METRIC_ICONS.content}
                iconBg="bg-brand-50"
              />
              <MetricCard
                label="Structure"
                value={breakdown.structure}
                weight="20%"
                icon={METRIC_ICONS.structure}
                iconBg="bg-violet-50"
              />
              <MetricCard
                label="Formatting"
                value={breakdown.formatting}
                weight="10%"
                icon={METRIC_ICONS.formatting}
                iconBg="bg-slate-100"
              />
            </div>

            {/* Missing keywords */}
            <div className="card space-y-4">
              <h2 className="font-bold text-slate-950 text-base">Missing Keywords</h2>
              <MissingKeywords keywords={missingKeywords} />
            </div>

            {/* Recommendations */}
            <div className="card space-y-3 sm:space-y-4 lg:col-span-2">
              <h2 className="font-bold text-slate-950 text-sm sm:text-base">Recommendations</h2>
              <div className="space-y-2 sm:space-y-3">
                {recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 sm:gap-3 rounded-xl p-3 sm:p-4 border-l-4 ${recommendationAccent(rec.field)}`}
                  >
                    <Badge variant={recommendationVariant(rec.field)}>
                      {rec.field}
                    </Badge>
                    <p className="text-xs sm:text-sm text-slate-700 flex-1 leading-relaxed">{rec.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Enhance CV */}
        {activeTab === 'enhance' && (
          <div className="space-y-4 animate-fade-in-up">
            {enhancing && (
              <div className="card flex flex-col items-center justify-center py-14 gap-4">
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
                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Estimated Score After Improvements</p>
                      <div className="flex items-end gap-1.5 sm:gap-2">
                        <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600">{enhanceResult.estimatedNewScore}</span>
                        <span className="text-base sm:text-lg text-slate-400 mb-0.5 sm:mb-1">/100</span>
                        <span className="text-xs sm:text-sm text-emerald-600 font-semibold mb-0.5 sm:mb-1">
                          +{enhanceResult.estimatedNewScore - score.score} pts
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Current Score</p>
                      <p className="text-2xl sm:text-3xl font-bold text-slate-600">{score.score}<span className="text-base sm:text-lg text-slate-400">/100</span></p>
                    </div>
                  </div>
                </div>

                {enhanceResult.sections.map((s: SectionSuggestion, i: number) => (
                  <div key={i} className="card space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wide text-brand-600 bg-brand-50 px-3 py-1 rounded-full ring-1 ring-brand-100">{s.section}</span>
                        <p className="text-sm text-slate-500 mt-2 italic leading-relaxed">{s.issue}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="rounded-xl bg-red-50 ring-1 ring-red-100 p-4">
                        <p className="text-xs font-semibold text-red-500 mb-2 uppercase tracking-wide">Current</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{s.currentContent}</p>
                      </div>
                      <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-100 p-4">
                        <p className="text-xs font-semibold text-emerald-600 mb-2 uppercase tracking-wide">Improved</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{s.improvedVersion}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopy(s.improvedVersion, i)}
                      className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-all ${
                        copiedIdx === i
                          ? 'bg-emerald-600 text-white'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {copiedIdx === i ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied!
                        </span>
                      ) : (
                        'Copy improved version'
                      )}
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Tab: Bullet Rewriter */}
        {activeTab === 'bullets' && (
          <div className="card animate-fade-in-up">
            <h2 className="font-bold text-slate-950 mb-1 text-sm sm:text-base">AI Bullet Point Rewriter</h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6 leading-relaxed">
              Tap any bullet point to get 3 AI-rewritten alternatives optimised for ATS.
            </p>
            {allBullets.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-10">
                No bullet points detected in your resume experience section.
              </p>
            ) : (
              <div className="space-y-5">
                {parsedData?.experience.map((exp, eIdx) => (
                  <div key={eIdx}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-6 w-6 rounded-md bg-brand-50 flex items-center justify-center flex-shrink-0">
                        <svg className="h-3.5 w-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        {exp.title} @ {exp.company}
                      </p>
                    </div>
                    <ul className="space-y-1.5 sm:space-y-2">
                      {exp.bullets.map((bullet, bIdx) => (
                        <li
                          key={bIdx}
                          onClick={() => setSelectedBullet(bullet)}
                          className="flex items-start gap-2 sm:gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 sm:p-4 cursor-pointer hover:border-brand-300 hover:bg-brand-50 transition-all duration-150 group active:bg-brand-50 active:border-brand-300"
                        >
                          <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5 text-brand-500 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <p className="text-xs sm:text-sm text-slate-700 flex-1 leading-relaxed">{bullet}</p>
                          <span className="text-xs text-brand-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            Rewrite
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
          <div className="space-y-5 animate-fade-in-up">
            <ShareCard score={score.score} />

            <div className="card">
              <h2 className="font-bold text-slate-950 mb-2 text-base">Download Options</h2>
              <p className="text-sm text-slate-500 mb-4 leading-relaxed">
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

      {/* AI Prompt Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-float animate-slide-up flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-950">Generate Full CV with AI</h2>
                <p className="text-xs text-slate-500 mt-0.5">Copy this prompt and paste it into Claude, ChatGPT, or Gemini</p>
              </div>
              <button onClick={() => setShowPromptModal(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-4">
                <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                  {buildAIPrompt()}
                </pre>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCopyPrompt}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
                    promptCopied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:from-brand-700 hover:to-brand-800'
                  }`}
                >
                  {promptCopied ? (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied! Now paste it in your AI tool
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Prompt
                    </>
                  )}
                </button>
                <a
                  href="https://claude.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Open Claude.ai
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              <p className="text-xs text-slate-400 text-center">
                Tip: Paste the prompt into Claude or ChatGPT, then download the response as a Word doc and format it.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enhance CTA Modal */}
      {showEnhanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-float animate-slide-up overflow-hidden">
            <div className="bg-hero dot-pattern px-6 py-8 text-center text-white relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-600/80 to-violet-600/80" />
              </div>
              <div className="relative">
                <p className="text-6xl font-extrabold mb-1">{score.score}<span className="text-2xl opacity-60">/100</span></p>
                <p className="text-sm opacity-75 mt-1">Your current ATS score</p>
              </div>
            </div>
            <div className="px-6 py-6 text-center space-y-4">
              <div>
                <p className="text-lg font-bold text-slate-950">Want to score higher?</p>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                  Our AI analyses each section of your CV and shows you exactly what to improve.
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

      {/* Sticky bottom bar — glass effect */}
      {activeTab !== 'enhance' && (
        <div className="sticky bottom-0 z-40 border-t border-slate-200/80 bg-white/90 backdrop-blur-xl px-4 sm:px-5 py-2.5 sm:py-3.5 shadow-float">
          <div className="mx-auto max-w-5xl flex items-center justify-between gap-3">
            <div className="hidden sm:flex items-center gap-3">
              <div className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white bg-gradient-to-br from-brand-600 to-violet-600 shadow-soft`}>
                {score.score}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Score {score.score}/100 — want to do better?</p>
                <p className="text-xs text-slate-500">AI will show you exactly what to fix, section by section</p>
              </div>
            </div>
            <button
              onClick={() => { setActiveTab('enhance'); handleEnhance(); }}
              className="flex-shrink-0 flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-glow hover:opacity-95 transition-opacity w-full sm:w-auto justify-center"
            >
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Enhance My CV with AI
            </button>
          </div>
        </div>
      )}

      <footer className="border-t border-slate-200 bg-white py-4 sm:py-6 text-center text-xs text-slate-400">
        © 2025 FresherCV · Free forever · No login required
      </footer>
    </div>
  );
}
