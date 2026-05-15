interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

import React from 'react';

const variants = {
  default: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200/60',
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60',
  danger: 'bg-red-50 text-red-700 ring-1 ring-red-200/60',
  info: 'bg-brand-50 text-brand-700 ring-1 ring-brand-200/60',
};

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={`badge font-medium ${variants[variant]}`}>{children}</span>
  );
}
