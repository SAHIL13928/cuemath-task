const CHUNK_SIZE = 15000;

/**
 * Clean extracted PDF text: remove excessive whitespace, page numbers, headers/footers.
 */
function cleanText(text: string): string {
  return (
    text
      // Remove page numbers (standalone numbers on a line)
      .replace(/^\s*\d+\s*$/gm, "")
      // Remove common header/footer patterns
      .replace(/^(Page\s+\d+.*|©.*|All rights reserved.*)$/gim, "")
      // Collapse multiple blank lines into one
      .replace(/\n{3,}/g, "\n\n")
      // Collapse multiple spaces into one
      .replace(/[ \t]{2,}/g, " ")
      // Trim each line
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      .trim()
  );
}

/**
 * Split text into logical chunks, trying to break at paragraph boundaries.
 */
function chunkText(text: string): string[] {
  if (text.length <= CHUNK_SIZE) {
    return [text];
  }

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= CHUNK_SIZE) {
      chunks.push(remaining);
      break;
    }

    // Try to break at a paragraph boundary (double newline)
    let breakPoint = remaining.lastIndexOf("\n\n", CHUNK_SIZE);

    // Fall back to single newline
    if (breakPoint < CHUNK_SIZE * 0.5) {
      breakPoint = remaining.lastIndexOf("\n", CHUNK_SIZE);
    }

    // Fall back to sentence boundary
    if (breakPoint < CHUNK_SIZE * 0.5) {
      breakPoint = remaining.lastIndexOf(". ", CHUNK_SIZE);
      if (breakPoint > 0) breakPoint += 1; // Include the period
    }

    // Last resort: hard cut
    if (breakPoint < CHUNK_SIZE * 0.3) {
      breakPoint = CHUNK_SIZE;
    }

    chunks.push(remaining.slice(0, breakPoint).trim());
    remaining = remaining.slice(breakPoint).trim();
  }

  return chunks;
}

/**
 * Extract text content from a PDF buffer.
 * Returns cleaned text. If very long, returns chunked sections joined by a separator.
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Use require to avoid ES module issues with pdf-parse in Next.js App Router
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse");
  const data = await pdfParse(buffer);
  const cleaned = cleanText(data.text);

  if (!cleaned) {
    throw new Error("No readable text found in PDF");
  }

  return cleaned;
}

/**
 * Extract and chunk PDF text for processing in parts.
 */
export async function extractAndChunkPDF(buffer: Buffer): Promise<string[]> {
  const text = await extractTextFromPDF(buffer);
  return chunkText(text);
}
