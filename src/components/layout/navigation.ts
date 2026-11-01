import {
  Bookmark,
  BookOpen,
  ClipboardCheck,
  FolderOpen,
  Layers,
  LayoutDashboard,
  Settings,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

export type ViewId =
  | 'dashboard'
  | 'documents'
  | 'generate'
  | 'library'
  | 'flashcards'
  | 'practice'
  | 'bookmarks'
  | 'settings';

export interface NavItem {
  id: ViewId;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'documents', label: 'My Documents', icon: FolderOpen },
  { id: 'generate', label: 'Generate Notes', icon: Sparkles },
  { id: 'library', label: 'Study Library', icon: BookOpen },
  { id: 'flashcards', label: 'Flashcards', icon: Layers },
  { id: 'practice', label: 'Practice Tests', icon: ClipboardCheck },
  { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const APP_NAME = 'LumiNotes';
