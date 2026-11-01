import type { ExtractedSection } from '@/lib/documentText';

const JSZIP_MODULE_URL = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm';
const DRAWING_NAMESPACE = 'http://schemas.openxmlformats.org/drawingml/2006/main';
const SLIDE_PATH_PATTERN = /^ppt\/slides\/slide(\d+)\.xml$/;

interface ZipEntry {
  async(type: 'string'): Promise<string>;
}

interface ZipArchive {
  files: Record<string, unknown>;
  file(path: string): ZipEntry | null;
}

interface JSZipStatic {
  loadAsync(data: Blob): Promise<ZipArchive>;
}

export async function extractPptxSections(file: File): Promise<ExtractedSection[]> {
  const { default: JSZip } = (await import(/* @vite-ignore */ JSZIP_MODULE_URL)) as { default: JSZipStatic };

  let zip: ZipArchive;
  try {
    zip = await JSZip.loadAsync(file);
  } catch {
    throw new Error('This PowerPoint file could not be opened. It may be corrupted.');
  }

  const slidePaths = Object.keys(zip.files)
    .map((path) => ({ path, match: SLIDE_PATH_PATTERN.exec(path) }))
    .filter((entry): entry is { path: string; match: RegExpExecArray } => entry.match !== null)
    .sort((a, b) => Number(a.match[1]) - Number(b.match[1]));

  if (slidePaths.length === 0) {
    throw new Error('No slides were found in this PowerPoint file.');
  }

  const sections: ExtractedSection[] = [];
  for (const { path, match } of slidePaths) {
    const xml = await zip.file(path)?.async('string');
    sections.push({ label: `Slide ${match[1]}`, text: xml ? slideXmlToText(xml) : '' });
  }
  return sections;
}

function slideXmlToText(xml: string): string {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const paragraphs = Array.from(doc.getElementsByTagNameNS(DRAWING_NAMESPACE, 'p'));

  return paragraphs
    .map((paragraph) =>
      Array.from(paragraph.getElementsByTagNameNS(DRAWING_NAMESPACE, 't'))
        .map((run) => run.textContent ?? '')
        .join('')
        .trim(),
    )
    .filter((line) => line.length > 0)
    .join('\n');
}
