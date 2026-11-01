import { Construction } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

interface ComingSoonPageProps {
  title: string;
  onBack: () => void;
}

export function ComingSoonPage({ title, onBack }: ComingSoonPageProps) {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-navy-900">{title}</h1>
      </header>
      <EmptyState
        icon={Construction}
        title="This section is coming soon"
        description="Your uploaded documents are already saved and ready. This area will be connected to them in an upcoming release."
        action={
          <Button variant="secondary" onClick={onBack}>
            Back to dashboard
          </Button>
        }
      />
    </div>
  );
}
