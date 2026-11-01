import { Network } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { toneFor } from '@/lib/topicTones';
import type { StudyNoteSection } from '@/types/studyNotes';

const MAX_POINTS = 4;
const MAX_TERMS = 6;

interface MindMapTabProps {
  title: string;
  sections: StudyNoteSection[];
}

export function MindMapTab({ title, sections }: MindMapTabProps) {
  const branches = sections.flatMap((section) =>
    section.topics.map((topic) => ({ topic, sectionLabel: section.label })),
  );

  if (branches.length === 0) {
    return (
      <EmptyState
        icon={Network}
        title="No mind map yet"
        description="Generate notes first and your topics will be arranged here as a colour-coded mind map."
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center">
        <div className="max-w-full truncate rounded-full bg-sky-700 px-6 py-3 text-center text-sm font-semibold text-white shadow-lift">
          {title}
        </div>
        <div className="h-8 w-px bg-navy-200" aria-hidden="true" />
        <div className="h-px w-2/3 bg-navy-200" aria-hidden="true" />
      </div>

      <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {branches.map(({ topic, sectionLabel }, index) => {
          const tone = toneFor(index);
          const hiddenPoints = topic.keyPoints.length - MAX_POINTS;
          const hiddenTerms = topic.terms.length - MAX_TERMS;

          return (
            <li key={index} className={`rounded-2xl border ${tone.border} ${tone.soft} p-5 shadow-card`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${tone.accent}`}>{sectionLabel}</p>
              <h3 className="mt-2 flex items-start gap-3 text-base font-semibold leading-snug text-navy-900">
                <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${tone.bar}`} aria-hidden="true" />
                <span>{topic.heading}</span>
              </h3>

              {topic.keyPoints.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {topic.keyPoints.slice(0, MAX_POINTS).map((point, pointIndex) => (
                    <li key={pointIndex} className="flex gap-2 text-sm leading-relaxed text-navy-800">
                      <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${tone.bar}`} aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                  {hiddenPoints > 0 && <li className="text-xs font-medium text-navy-600">+{hiddenPoints} more in notes</li>}
                </ul>
              )}

              {topic.terms.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {topic.terms.slice(0, MAX_TERMS).map((item, termIndex) => (
                    <span key={termIndex} className={`rounded-full px-3 py-1 text-xs font-medium ${tone.chip}`}>
                      {item.term}
                    </span>
                  ))}
                  {hiddenTerms > 0 && (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-navy-700">+{hiddenTerms}</span>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
