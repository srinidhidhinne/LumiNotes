import { useState } from 'react';
import { LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, TextInput } from '@/components/ui/Field';
import { useAuth } from '@/hooks/useAuth';

interface SettingsPageProps {
  userEmail: string;
}

export function SettingsPage({ userEmail }: SettingsPageProps) {
  const { signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setError(null);
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not log out. Please try again.');
      setIsSigningOut(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-navy-900">Settings</h1>
        <p className="mt-2 text-navy-500">Manage your account and how you access LumiNotes.</p>
      </header>

      <section className="space-y-6 rounded-2xl border border-navy-100 bg-white p-6 shadow-card">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-sky-600" aria-hidden="true" />
          <h2 className="text-base font-semibold text-navy-900">Account</h2>
        </div>
        <Field label="Email" htmlFor="settings-email" hint="Your email is used to log in to LumiNotes.">
          <TextInput id="settings-email" value={userEmail} readOnly className="bg-navy-50 text-navy-600" />
        </Field>
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="flex justify-end">
          <Button variant="secondary" onClick={() => void handleSignOut()} isLoading={isSigningOut}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Log out
          </Button>
        </div>
      </section>
    </div>
  );
}
