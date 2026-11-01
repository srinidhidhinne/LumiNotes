import { APP_NAME } from '@/components/layout/navigation';

interface WordmarkProps {
  className?: string;
}

export function Wordmark({ className = '' }: WordmarkProps) {
  return (
    <span className={`font-display tracking-tight ${className}`}>
      {APP_NAME}
    </span>
  );
}
