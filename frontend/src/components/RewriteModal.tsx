import { useState } from 'react';
import Button from './ui/Button';
import { generateRewrites, selectRewrite } from '../api/aiRewrite';
import { useResumeStore } from '../store/resumeStore';

interface RewriteModalProps {
  bulletPoint: string;
  onClose: () => void;
}

export default function RewriteModal({ bulletPoint, onClose }: RewriteModalProps) {
  const { resumeId, jobDescription, setRewrites, setSelectedRewrite } = useResumeStore();
  const [rewrites, setLocalRewrites] = useState<string[]>([]);
  const [rewriteId, setRewriteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);

  async function handleGenerate() {
    if (!resumeId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await generateRewrites(resumeId, bulletPoint, jobDescription);
      setLocalRewrites(res.data.rewrites);
      setRewriteId(res.data.rewriteId);
      setRewrites(res.data.rewrites);
      setGenerated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate rewrites');
    } finally {
      setLoading(false);
    }
  }

  async function handleSelect(rewrite: string, idx: number) {
    if (!rewriteId) return;
    try {
      await selectRewrite(rewriteId, rewrite);
      setSelectedRewrite(rewrite);
      await navigator.clipboard.writeText(rewrite);
      setCopied(idx);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // silent — copy still works
    }
  }

  async function handleCopy(text: string, idx: number) {
    await navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">AI Bullet Rewriter</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-200">
            <p className="font-medium text-slate-500 text-xs mb-1 uppercase tracking-wide">Original</p>
            {bulletPoint}
          </div>

          {!generated && (
            <Button onClick={handleGenerate} loading={loading} className="w-full">
              {loading ? 'Generating 3 AI rewrites...' : 'Generate AI Rewrites'}
            </Button>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          {rewrites.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">Choose a rewrite:</p>
              {rewrites.map((r, i) => (
                <div
                  key={i}
                  className="relative rounded-xl border border-slate-200 p-4 text-sm text-slate-700 hover:border-brand-300 hover:bg-brand-50 transition-colors"
                >
                  <p className="pr-20">{r}</p>
                  <div className="absolute right-3 top-3 flex gap-2">
                    <button
                      onClick={() => handleCopy(r, i)}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      {copied === i ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={() => handleSelect(r, i + 100)}
                      className="rounded-lg bg-brand-600 px-3 py-1 text-xs font-medium text-white hover:bg-brand-700"
                    >
                      Use
                    </button>
                  </div>
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerate}
                loading={loading}
                className="w-full"
              >
                Regenerate
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
