import { supabase } from '@/lib/supabase';
import type { ThemeMode } from '@/types/preferences';

export async function loadThemePreference(): Promise<ThemeMode | null> {
  const { data, error } = await supabase.from('user_preferences').select('theme').maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return data.theme === 'dark' ? 'dark' : 'light';
}

export async function saveThemePreference(theme: ThemeMode): Promise<void> {
  const { error } = await supabase
    .from('user_preferences')
    .upsert({ theme, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  if (error) throw new Error(error.message);
}
