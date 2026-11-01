export interface TopicTone {
  soft: string;
  border: string;
  accent: string;
  chip: string;
  bar: string;
  strong: string;
}

// Solid tones are fixed hex values so white text stays readable in both themes.
export const TOPIC_TONES: TopicTone[] = [
  {
    soft: 'bg-lavender-100',
    border: 'border-lavender-300',
    accent: 'text-plum-700',
    chip: 'bg-lavender-200 text-navy-900',
    bar: 'bg-lavender-500',
    strong: 'bg-[#7A60A2] text-white',
  },
  {
    soft: 'bg-blush-100',
    border: 'border-blush-300',
    accent: 'text-blush-800',
    chip: 'bg-blush-200 text-blush-900',
    bar: 'bg-blush-400',
    strong: 'bg-[#9E4F6E] text-white',
  },
  {
    soft: 'bg-sage-100',
    border: 'border-sage-300',
    accent: 'text-sage-800',
    chip: 'bg-sage-200 text-sage-900',
    bar: 'bg-sage-400',
    strong: 'bg-[#4E6E40] text-white',
  },
  {
    soft: 'bg-cream-200',
    border: 'border-navy-200',
    accent: 'text-plum-700',
    chip: 'bg-white text-navy-800',
    bar: 'bg-plum-400',
    strong: 'bg-[#70558F] text-white',
  },
];

export function toneFor(index: number): TopicTone {
  return TOPIC_TONES[((index % TOPIC_TONES.length) + TOPIC_TONES.length) % TOPIC_TONES.length];
}
