import { useRef, useState } from 'react';
import { BookText, FileText, GitBranch, Layers, Network } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { AskAboutSelection } from '@/components/study/AskAboutSelection';
import { AskSelectionButton } from '@/components/study/AskSelectionButton';
import { CompleteNotesTab } from '@/components/study/CompleteNotesTab';
import { DiagramTab } from '@/components/study/DiagramTab';
import { FlashcardsTab } from '@/components/study/FlashcardsTab';
import { MindMapTab } from '@/components/study/MindMapTab';
import { SourceTextTab } from '@/components/study/SourceTextTab';
import { useStudyNotes } from '@/hooks/useStudyNotes';
import { useTextSelection } from '@/hooks/useTextSelection';
import type { DocumentSummary } from '@/types/document';

interface StudyWorkspaceDialogProps {
  document: DocumentSummary;
  onClose: () => void;
}

type WorkspaceTab = 'notes' | 'flashcards' | 'mindmap' | 'diagrams' | 'source';

const TABS: { id: WorkspaceTab; label: string; icon: typeof BookText }[] = [
  { id: 'notes', label: 'Complete Notes', icon: BookText },
  { id: 'flashcards', label: 'Flashcards', icon: Layers },
  { id: 'mindmap', label: 'Mind Map', icon: Network },
  { id: 'diagrams', label: 'Diagrams', icon: GitBranch },
  { id: 'source', label: 'Source Text', icon: FileText },
];

export function StudyWorkspaceDialog({ document, onClose }: StudyWorkspaceDialogProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('notes');
  const [askQuote, setAskQuote] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const selection = useTextSelection(contentRef);
  const notes = useStudyNotes(document.id);
  const isAsking = askQuote !== null;

  return (
    <Modal
      title={document.title}
      description={[document.subject, document.chapter].filter(Boolean).join(' / ') || document.file_name}
      onClose={onClose}
      maxWidthClass="max-w-4xl"
    >
      <div ref={contentRef}>
        <div hidden={isAsking}>
          <div role="tablist" aria-label="Study workspace sections" className="mb-6 flex gap-1 overflow-x-auto border-b border-navy-100">
            {TABS.map((tab) => {
              const isActive = tab.id === activeTab;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'border-plum-600 text-navy-900'
                      : 'border-transparent text-navy-500 hover:text-navy-800'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div role="tabpanel" id="panel-notes" aria-labelledby="tab-notes" hidden={activeTab !== 'notes'}>
            {activeTab === 'notes' && <CompleteNotesTab notes={notes} />}
          </div>
          <div role="tabpanel" id="panel-flashcards" aria-labelledby="tab-flashcards" hidden={activeTab !== 'flashcards'}>
            {activeTab === 'flashcards' && <FlashcardsTab documentId={document.id} sections={notes.sections} />}
          </div>
          <div role="tabpanel" id="panel-mindmap" aria-labelledby="tab-mindmap" hidden={activeTab !== 'mindmap'}>
            {activeTab === 'mindmap' && <MindMapTab title={document.title} sections={notes.sections} />}
          </div>
          <div role="tabpanel" id="panel-diagrams" aria-labelledby="tab-diagrams" hidden={activeTab !== 'diagrams'}>
            {activeTab === 'diagrams' && <DiagramTab documentId={document.id} />}
          </div>
          <div role="tabpanel" id="panel-source" aria-labelledby="tab-source" hidden={activeTab !== 'source'}>
            {activeTab === 'source' && <SourceTextTab document={document} />}
          </div>
        </div>

        {isAsking && (
          <AskAboutSelection documentId={document.id} quote={askQuote} onBack={() => setAskQuote(null)} />
        )}
      </div>

      {selection && !isAsking && <AskSelectionButton selection={selection} onAsk={setAskQuote} />}
    </Modal>
  );
}
