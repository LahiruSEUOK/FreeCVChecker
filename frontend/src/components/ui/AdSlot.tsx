interface AdSlotProps {
  slot: 'banner' | 'sidebar' | 'inline';
  className?: string;
}

const dimensions = {
  banner: 'h-24 w-full',
  sidebar: 'h-64 w-full',
  inline: 'h-20 w-full',
};

export default function AdSlot({ slot, className = '' }: AdSlotProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400 ${dimensions[slot]} ${className}`}
      aria-label="Advertisement"
    >
      Ad — {slot}
      {/* Replace with real AdSense ins tag in production */}
    </div>
  );
}
