export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export const ACCEPTED_FILE_TYPES = '.pdf,.pptx,.ppt,.txt,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.presentationml.presentation';

export interface ExtractedSection {
  label: string;
  text: string;
}

export interface ExtractedText {
  content: string;
  sectionKind: 'Page' | 'Slide' | null;
  totalSections: number;
  readSections: number;
  unreadableSections: string[];
  wordCount: number;
  lineCount: number;
  characterCount: number;
}

export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? (parts.pop() ?? '').toLowerCase() : '';
}

export function getFileTitle(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
}

export function validateUploadFile(file: File): string | null {
  const extension = getFileExtension(file.name);

  if (extension === 'ppt') {
    return 'Older .ppt files cannot be read yet. Open the file in PowerPoint, save it as .pptx, and upload that instead.';
  }
  if (!['pdf', 'pptx', 'txt'].includes(extension)) {
    return 'This file type is not supported. Please upload a PDF, PPTX or TXT file.';
  }
  if (file.size === 0) {
    return 'This file is empty.';
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return 'Files must be 20 MB or smaller.';
  }
  return null;
}

async function readSections(file: File): Promise<{ sections: ExtractedSection[]; sectionKind: 'Page' | 'Slide' | null }> {
  const extension = getFileExtension(file.name);
  if (extension === 'pdf') {
    const { extractPdfSections } = await import('@/lib/extractors/pdfExtractor');
    return { sections: await extractPdfSections(file), sectionKind: 'Page' };
  }
  if (extension === 'pptx') {
    const { extractPptxSections } = await import('@/lib/extractors/pptxExtractor');
    return { sections: await extractPptxSections(file), sectionKind: 'Slide' };
  }
  return { sections: [{ label: '', text: await file.text() }], sectionKind: null };
}

function buildContent(sections: ExtractedSection[], sectionKind: 'Page' | 'Slide' | null): string {
  if (sectionKind === null) return sections[0].text.replace(/\r\n?/g, '\n').trim();

  return sections
    .filter((section) => section.text.length > 0)
    .map((section) => `--- ${section.label} ---\n${section.text}`)
    .join('\n\n');
}

export async function extractTextFromFile(file: File): Promise<ExtractedText> {
  const { sections, sectionKind } = await readSections(file);

  const unreadableSections = sectionKind
    ? sections.filter((section) => section.text.length === 0).map((section) => section.label)
    : [];

  if (sections.every((section) => section.text.length === 0)) {
    throw new Error(
      sectionKind
        ? 'No readable text was found. This file may contain only scanned images, which are not supported yet.'
        : 'No readable text was found in this file.',
    );
  }

  if (sectionKind === null && sections[0].text.includes('\u0000')) {
    throw new Error('This file appears to contain binary data rather than readable text.');
  }

  const content = buildContent(sections, sectionKind);

  return {
    content,
    sectionKind,
    totalSections: sectionKind ? sections.length : 0,
    readSections: sectionKind ? sections.length - unreadableSections.length : 0,
    unreadableSections,
    wordCount: content.split(/\s+/).filter(Boolean).length,
    lineCount: content.split('\n').filter((line) => line.trim().length > 0).length,
    characterCount: content.length,
  };
}
