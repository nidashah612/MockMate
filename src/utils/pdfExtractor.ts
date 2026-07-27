import * as pdfjsLib from 'pdfjs-dist';

// Set global worker source to load pdfjs worker dynamically from cdn jsdelivr
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

/**
 * Parses a File object (.pdf, .txt, .md, .doc) and extracts readable plain text.
 */
export async function parseResumeFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();

  // If it's a PDF file
  if (fileName.endsWith('.pdf') || file.type === 'application/pdf') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      let text = '';

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ');
        text += pageText + '\n\n';
      }

      const trimmed = text.trim();
      if (!trimmed) {
        throw new Error('No selectable text found in PDF. It might be a scanned image PDF.');
      }
      return trimmed;
    } catch (err: any) {
      console.error('PDF parsing error:', err);
      throw new Error('Could not parse PDF text: ' + (err.message || 'Ensure it contains selectable text.'));
    }
  }

  // Plain text, markdown, doc, csv, etc.
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        reject(new Error('File is empty'));
      } else {
        // Strip non-printable binary garbage if user uploaded docx without parser
        const sanitized = result.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
        resolve(sanitized);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
