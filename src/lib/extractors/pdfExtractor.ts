import type { ExtractedSection } from '@/lib/documentText';

const PDFJS_VERSION = '4.10.38';
const PDFJS_MODULE_URL = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.min.mjs`;
const PDFJS_WORKER_URL = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;

interface PdfTextItem {
  str?: string;
  hasEOL?: boolean;
}

interface PdfPage {
  getTextContent(): Promise<{ items: PdfTextItem[] }>;
}

interface PdfDocument {
  numPages: number;
  getPage(pageNumber: number): Promise<PdfPage>;
}

interface PdfLoadingTask {
  promise: Promise<PdfDocument>;
  destroy(): Promise<void>;
}

interface PdfJsModule {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument(params: { data: Uint8Array }): PdfLoadingTask;
}

export async function extractPdfSections(file: File): Promise<ExtractedSection[]> {
  const pdfjs = (await import(/* @vite-ignore */ PDFJS_MODULE_URL)) as PdfJsModule;
  pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;

  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjs.getDocument({ data });

  let pdf: PdfDocument;
  try {
    pdf = await loadingTask.promise;
  } catch (err) {
    const isPasswordProtected = err instanceof Error && err.name === 'PasswordException';
    throw new Error(
      isPasswordProtected
        ? 'This PDF is password-protected. Remove the password and upload it again.'
        : 'This PDF could not be opened. It may be corrupted.',
    );
  }

  try {
    const sections: ExtractedSection[] = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) => (item.str ?? '') + (item.hasEOL ? '\n' : ' '))
        .join('')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n\s*\n+/g, '\n')
        .trim();
      sections.push({ label: `Page ${pageNumber}`, text });
    }
    return sections;
  } finally {
    await loadingTask.destroy();
  }
}
