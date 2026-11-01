import { useState, type FormEvent } from 'react';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getAuthErrorMessage } from '@/lib/authErrors';
import { Button } from '@/components/ui/Button';
import { Field, TextInput } from '@/components/ui/Field';
import { Wordmark } from '@/components/ui/Wordmark';

type AuthMode = 'login' | 'signup';

const MIN_PASSWORD_LENGTH = 6;

const highlights = [
  'Upload your notes and get topic-wise explanations',
  'Practice with questions tailored to your material',
  'Ask follow-up questions about any passage',
];

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === 'signup';

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError(null);
    setNotice(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (isSignup && password.length < MIN_PASSWORD_LENGTH) {
      setError(`Your password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSignup) {
        const needsLogin = await signUp(trimmedEmail, password);
        if (needsLogin) {
          setNotice('Your account is ready. Please log in with your new password.');
          setMode('login');
          setPassword('');
        }
      } else {
        await signIn(trimmedEmail, password);
      }
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <aside className="relative hidden w-[44%] flex-col justify-between overflow-hidden border-r border-navy-100 bg-lavender-200 p-12 text-navy-900 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-plum-700">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </div>
          <Wordmark className="text-2xl" />
        </div>

        <div className="max-w-md">
          <h1 className="text-4xl leading-tight">
            Upload your notes. Understand every concept. Prepare smarter.
          </h1>
          <ul className="mt-8 space-y-4">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3 text-navy-700">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-plum-600" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-navy-600">Built for school and college students.</p>
      </aside>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-[fadeIn_300ms_ease-out]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </div>
            <Wordmark className="text-2xl text-navy-900" />
          </div>

          <h2 className="text-2xl font-semibold text-navy-900">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="mt-2 text-sm text-navy-500">
            {isSignup
              ? 'Start turning your study material into clear, organized notes.'
              : 'Log in to continue where you left off.'}
          </p>

          <div className="mt-8 grid grid-cols-2 rounded-xl bg-navy-100/70 p-1" role="tablist">
            {(['login', 'signup'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={mode === tab}
                onClick={() => switchMode(tab)}
                className={`h-9 rounded-lg text-sm font-medium transition-all duration-200 ${
                  mode === tab
                    ? 'bg-white text-navy-900 shadow-sm'
                    : 'text-navy-500 hover:text-navy-800'
                }`}
              >
                {tab === 'login' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            <Field label="Email" htmlFor="auth-email">
              <TextInput
                id="auth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                required
              />
            </Field>

            <Field
              label="Password"
              htmlFor="auth-password"
              hint={isSignup ? `At least ${MIN_PASSWORD_LENGTH} characters.` : undefined}
            >
              <TextInput
                id="auth-password"
                type="password"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </Field>

            {notice && (
              <p role="status" className="rounded-xl bg-sky-50 px-4 py-3 text-sm text-sky-700">
                {notice}
              </p>
            )}
            {error && (
              <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              {isSignup ? 'Create account' : 'Log in'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
