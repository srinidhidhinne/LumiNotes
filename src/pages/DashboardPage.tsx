import { useState } from 'react';
import { Bookmark, ClipboardCheck, FileText, Layers, BookOpen, Sparkles, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { QuickTile } from '@/components/dashboard/QuickTile';
import { StatCard } from '@/components/dashboard/StatCard';
import { StudyWorkspaceDialog } from '@/components/study/StudyWorkspaceDialog';
import { UploadDialog } from '@/components/documents/UploadDialog';
import { useDocuments } from '@/hooks/useDocuments';
import { useStudyProgress } from '@/hooks/useStudyProgress';
import { formatNumber } from '@/lib/format';
import type { ViewId } from '@/components/layout/navigation';
import type { DocumentSummary } from '@/types/document';

const RECENT_LIMIT = 3;

interface DashboardPageProps {
  userEmail: string;
  onNavigate: (view: ViewId) => void;
}

function getDisplayName(email: string): string {
  const localPart = email.split('@')[0] ?? '';
  const cleaned = localPart.replace(/[._-]+/g, ' ').trim();
  if (!cleaned) return 'there';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function DashboardPage({ userEmail, onNavigate }: DashboardPageProps) {
  const { documents, isLoading, error, reload, addDocument } = useDocuments();
  const progress = useStudyProgress();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [openDocument, setOpenDocument] = useState<DocumentSummary | null>(null);

  const recent = documents.slice(0, RECENT_LIMIT);
  const progressRows = Object.values(progress.progress);
  const statsReady = !progress.isLoading && !progress.error;
  const notesReady = progressRows.filter((row) => row.noteSections > 0).length;
  const practiceCount = progressRows.filter((row) => row.hasPracticeTest).length;
  const savedTerms = progressRows.reduce((total, row) => total + row.savedTerms, 0);
  const statValue = (value: number) => (statsReady ? formatNumber(value) : '-');

  return (
    <div className="space-y-10">
      <header className="animate-[fadeIn_300ms_ease-out]">
        <p className="text-sm font-medium text-sky-600">Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy-900">
          Welcome back, {getDisplayName(userEmail)}
        </h1>
        <p className="mt-2 max-w-2xl text-navy-500">
          Upload your study material and let LumiNotes turn it into clear, organized notes you can actually learn from.
        </p>
      </header>

      <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Documents uploaded" value={isLoading ? '-' : formatNumber(documents.length)} icon={FileText} />
        <StatCard label="Notes ready" value={statValue(notesReady)} icon={Sparkles} />
        <StatCard label="Practice tests" value={statValue(practiceCount)} icon={ClipboardCheck} />
        <StatCard label="Saved terms" value={statValue(savedTerms)} icon={Bookmark} />
      </section>

      {progress.error && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          <span>Your study stats could not be loaded. {progress.error}</span>
          <Button variant="secondary" size="sm" onClick={progress.reload}>
            Try again
          </Button>
        </div>
      )}

      <section aria-label="Quick actions" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <QuickTile
          title="Upload document"
          description="Add a PDF, PowerPoint or text file."
          icon={Upload}
          toneClass="bg-lavender-200"
          onClick={() => setIsUploadOpen(true)}
        />
        <QuickTile
          title="Flashcards"
          description="Practice key terms one card at a time."
          icon={Layers}
          toneClass="bg-blush-200"
          onClick={() => onNavigate('flashcards')}
        />
        <QuickTile
          title="Practice tests"
          description="Check what you have learned."
          icon={ClipboardCheck}
          toneClass="bg-sage-200"
          onClick={() => onNavigate('practice')}
        />
        <QuickTile
          title="Study library"
          description="Track progress across every subject."
          icon={BookOpen}
          toneClass="bg-cream-200"
          onClick={() => onNavigate('library')}
        />
      </section>

      <section aria-labelledby="recent-heading" className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <h2 id="recent-heading" className="text-lg font-semibold text-navy-900">
            Recently uploaded
          </h2>
          {documents.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => onNavigate('documents')}>
              View all
            </Button>
          )}
        </div>

        {isLoading && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-busy="true">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-40 animate-pulse rounded-2xl bg-navy-100/60" />
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-red-50 p-5 text-sm text-red-700">
            <span>Your documents could not be loaded. {error}</span>
            <Button variant="secondary" size="sm" onClick={reload}>
              Try again
            </Button>
          </div>
        )}

        {!isLoading && !error && recent.length === 0 && (
          <EmptyState
            icon={FileText}
            title="No documents yet"
            description="Upload your first chapter to start building your study library."
            action={
              <Button onClick={() => setIsUploadOpen(true)}>
                <Upload className="h-4 w-4" aria-hidden="true" />
                Upload a document
              </Button>
            }
          />
        )}

        {!isLoading && !error && recent.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {recent.map((doc) => (
              <DocumentCard key={doc.id} document={doc} onOpen={setOpenDocument} />
            ))}
          </div>
        )}
      </section>

      {isUploadOpen && (
        <UploadDialog
          onClose={() => setIsUploadOpen(false)}
          onUploaded={addDocument}
        />
      )}
      {openDocument && (
        <StudyWorkspaceDialog
          document={openDocument}
          onClose={() => {
            setOpenDocument(null);
            progress.reload();
          }}
        />
      )}
    </div>
  );
}
