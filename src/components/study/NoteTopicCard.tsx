import { useState } from 'react';
import { ChevronDown, Lightbulb } from 'lucide-react';
import type { TopicTone } from '@/lib/topicTones';
import type { StudyTopic } from '@/types/studyNotes';

interface NoteTopicCardProps {
  topic: StudyTopic;
  tone: TopicTone;
  defaultOpen?: boolean;
}

export function NoteTopicCard({ topic, tone, defaultOpen = false }: NoteTopicCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const panelId = `topic-panel-${topic.heading.replace(/\W+/g, '-').toLowerCase()}`;

  return (
    <article className={`overflow-hidden rounded-2xl border ${tone.border} bg-white shadow-card transition-shadow duration-200 hover:shadow-lift`}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors duration-200 hover:bg-navy-50/60"
      >
        <span className={`h-10 w-1.5 shrink-0 rounded-full ${tone.bar}`} aria-hidden="true" />
        <span className="flex-1 text-base font-semibold text-navy-900">{topic.heading}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-navy-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div id={panelId} className="animate-fadeIn space-y-6 border-t border-navy-100 px-5 py-5">
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-navy-800">{topic.explanation}</p>

          {topic.keyPoints.length > 0 && (
            <div className={`rounded-xl ${tone.soft} p-4`}>
              <h4 className={`text-sm font-semibold ${tone.accent}`}>Key points</h4>
              <ul className="mt-3 space-y-2">
                {topic.keyPoints.map((point, index) => (
                  <li key={index} className="flex gap-3 text-sm leading-relaxed text-navy-800">
                    <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${tone.bar}`} aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {topic.terms.length > 0 && (
            <div>
              <h4 className={`text-sm font-semibold ${tone.accent}`}>Important terms</h4>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                {topic.terms.map((item, index) => (
                  <div key={index} className={`rounded-xl border ${tone.border} ${tone.soft} px-4 py-3`}>
                    <dt className="text-sm font-semibold text-navy-900">{item.term}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-navy-700">{item.meaning}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {topic.example && (
            <div className="flex gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-4">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-sky-800" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">
                  Additional example (not from your file)
                </p>
                <p className="mt-1 text-sm leading-relaxed text-navy-800">{topic.example}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
