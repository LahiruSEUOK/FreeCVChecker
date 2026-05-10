interface MissingKeywordsProps {
  keywords: string[];
}

export default function MissingKeywords({ keywords }: MissingKeywordsProps) {
  if (keywords.length === 0) {
    return (
      <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        All key skills detected!
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-slate-500 mb-3">
        Add these keywords to improve your ATS score:
      </p>
      <div className="flex flex-wrap gap-2">
        {keywords.map((kw) => (
          <span
            key={kw}
            className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 ring-1 ring-red-100"
          >
            {kw}
          </span>
        ))}
      </div>
    </div>
  );
}
