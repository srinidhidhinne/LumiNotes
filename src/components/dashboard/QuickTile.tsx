import { ArrowUpRight, type LucideIcon } from 'lucide-react';

interface QuickTileProps {
  title: string;
  description: string;
  icon: LucideIcon;
  toneClass: string;
  onClick: () => void;
}

export function QuickTile({ title, description, icon: Icon, toneClass, onClick }: QuickTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex min-h-36 flex-col justify-between rounded-2xl border border-white/60 p-5 text-left text-navy-900 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum-500 focus-visible:ring-offset-2 ${toneClass}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 text-plum-700 shadow-sm">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <ArrowUpRight
          className="h-5 w-5 text-navy-600 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </div>
      <div className="mt-6">
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm text-navy-700">{description}</p>
      </div>
    </button>
  );
}
