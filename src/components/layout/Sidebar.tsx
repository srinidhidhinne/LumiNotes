import { FileText, LogOut, Moon, Sun, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { NAV_ITEMS, type ViewId } from '@/components/layout/navigation';
import { Wordmark } from '@/components/ui/Wordmark';

interface SidebarProps {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
  onClose: () => void;
}

export function Sidebar({ activeView, onNavigate, onClose }: SidebarProps) {
  const { user, signOut } = useAuth();
  const { theme, error: themeError, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleNavigate = (view: ViewId) => {
    onNavigate(view);
    onClose();
  };

  return (
    <div className="flex h-full flex-col border-r border-navy-100 bg-white/80 text-navy-700 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 pb-6 pt-7">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 shadow-sm">
            <FileText className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <Wordmark className="text-xl text-navy-900" />
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="rounded-lg p-1.5 text-navy-400 hover:bg-navy-100 hover:text-navy-900 lg:hidden"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <nav aria-label="Main navigation" className="flex-1 space-y-1 overflow-y-auto px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === activeView;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavigate(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-sky-600 font-medium text-white shadow-sm'
                  : 'text-navy-600 hover:bg-navy-100 hover:text-navy-900'
              }`}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-navy-100 p-4">
        <p className="truncate px-2 text-xs text-navy-500" title={user?.email ?? undefined}>
          {user?.email}
        </p>
        <button
          type="button"
          onClick={toggleTheme}
          aria-pressed={isDark}
          className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-navy-600 transition-colors duration-200 hover:bg-navy-100 hover:text-navy-900"
        >
          {isDark ? <Sun className="h-[18px] w-[18px]" aria-hidden="true" /> : <Moon className="h-[18px] w-[18px]" aria-hidden="true" />}
          <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
        </button>
        {themeError && (
          <p role="alert" className="px-2 pt-2 text-xs text-red-700">
            {themeError}
          </p>
        )}
        <button
          type="button"
          onClick={() => void signOut()}
          className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-navy-600 transition-colors duration-200 hover:bg-navy-100 hover:text-navy-900"
        >
          <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
}
