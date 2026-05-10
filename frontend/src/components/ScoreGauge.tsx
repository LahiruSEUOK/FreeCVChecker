import { useEffect, useRef } from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

function scoreColor(score: number): string {
  if (score >= 75) return '#10b981'; // emerald
  if (score >= 50) return '#f59e0b'; // amber
  return '#ef4444';                  // red
}

function scoreLabel(score: number): string {
  if (score >= 75) return 'Strong Match';
  if (score >= 50) return 'Partial Match';
  return 'Needs Work';
}

export default function ScoreGauge({ score, size = 200 }: ScoreGaugeProps) {
  const clampedScore = Math.min(100, Math.max(0, score));
  const radius = 80;
  const stroke = 14;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = Math.PI * radius; // half circle
  const offset = circumference - (clampedScore / 100) * circumference;
  const color = scoreColor(clampedScore);

  const dashRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const el = dashRef.current;
    if (!el) return;
    el.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)';
    el.style.strokeDashoffset = String(offset);
  }, [offset]);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`}>
        {/* Track */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Progress */}
        <path
          ref={dashRef}
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
        {/* Score text */}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          fontSize="40"
          fontWeight="800"
          fill={color}
          fontFamily="Inter, sans-serif"
        >
          {clampedScore}
        </text>
        <text
          x={cx}
          y={cy + 16}
          textAnchor="middle"
          fontSize="13"
          fontWeight="600"
          fill="#64748b"
          fontFamily="Inter, sans-serif"
        >
          {scoreLabel(clampedScore)}
        </text>
      </svg>
    </div>
  );
}
