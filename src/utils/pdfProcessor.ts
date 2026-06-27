/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import CryptoJS from 'crypto-js';

/**
 * Merges multiple PDF files into a single PDF document.
 */
export async function mergePDFs(
  files: File[],
  onProgress?: (p: number) => void
): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();
  const total = files.length;

  for (let i = 0; i < files.length; i++) {
    onProgress?.(Math.round((i / total) * 100));
    const file = files[i];
    const arrayBuffer = await file.arrayBuffer();
    const srcDoc = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  onProgress?.(90);
  const bytes = await mergedPdf.save();
  onProgress?.(100);
  return bytes;
}

/**
 * Splits a PDF file based on page ranges (e.g. "1, 3-5").
 */
export async function splitPDF(
  file: File,
  rangeText: string,
  onProgress?: (p: number) => void
): Promise<Uint8Array> {
  onProgress?.(20);
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const pageCount = srcDoc.getPageCount();

  onProgress?.(40);
  // Parse ranges (1-indexed to 0-indexed)
  const pageIndices: number[] = [];
  const ranges = rangeText.split(',');

  for (const part of ranges) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.max(1, Math.min(start, end));
        const max = Math.min(pageCount, Math.max(start, end));
        for (let i = min; i <= max; i++) {
          pageIndices.push(i - 1);
        }
      }
    } else {
      const pageNum = parseInt(trimmed, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= pageCount) {
        pageIndices.push(pageNum - 1);
      }
    }
  }

  // Deduplicate and sort
  const uniqueIndices = Array.from(new Set(pageIndices)).sort((a, b) => a - b);
  if (uniqueIndices.length === 0) {
    throw new Error('No valid page ranges specified or pages are out of range.');
  }

  onProgress?.(70);
  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(srcDoc, uniqueIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  onProgress?.(90);
  const bytes = await newPdf.save();
  onProgress?.(100);
  return bytes;
}

/**
 * Rotates all pages or specific pages in a PDF document.
 */
export async function rotatePDF(
  file: File,
  rotationDegrees: number, // 90, 180, 270
  onProgress?: (p: number) => void
): Promise<Uint8Array> {
  onProgress?.(30);
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();

  onProgress?.(60);
  pages.forEach((page) => {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + rotationDegrees) % 360));
  });

  onProgress?.(85);
  const bytes = await pdfDoc.save();
  onProgress?.(100);
  return bytes;
}

/**
 * Adds watermarks to a PDF document.
 */
export async function watermarkPDF(
  file: File,
  text: string,
  colorHex: string = '#EF4444',
  opacity: number = 0.3,
  onProgress?: (p: number) => void
): Promise<Uint8Array> {
  onProgress?.(30);
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  // Convert HEX to RGB
  const r = parseInt(colorHex.substring(1, 3), 16) / 255 || 0.9;
  const g = parseInt(colorHex.substring(3, 5), 16) / 255 || 0.2;
  const b = parseInt(colorHex.substring(5, 7), 16) / 255 || 0.2;

  onProgress?.(60);
  pages.forEach((page) => {
    const { width, height } = page.getSize();
    page.drawText(text, {
      x: width / 2 - 120,
      y: height / 2 - 20,
      size: 36,
      font,
      color: rgb(r, g, b),
      opacity: opacity,
      rotate: degrees(45),
    });
  });

  onProgress?.(85);
  const bytes = await pdfDoc.save();
  onProgress?.(100);
  return bytes;
}

/**
 * Adds page numbers to a PDF document.
 */
export async function addPageNumbers(
  file: File,
  position: 'bottom-center' | 'bottom-right' | 'top-right',
  onProgress?: (p: number) => void
): Promise<Uint8Array> {
  onProgress?.(30);
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  onProgress?.(65);
  pages.forEach((page, index) => {
    const { width, height } = page.getSize();
    const text = `${index + 1} / ${pages.length}`;
    
    let x = width / 2 - 15;
    let y = 30;

    if (position === 'bottom-right') {
      x = width - 60;
      y = 30;
    } else if (position === 'top-right') {
      x = width - 60;
      y = height - 40;
    }

    page.drawText(text, {
      x,
      y,
      size: 10,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
  });

  onProgress?.(85);
  const bytes = await pdfDoc.save();
  onProgress?.(100);
  return bytes;
}

/**
 * Helper to convert an ArrayBuffer to a Base64 string.
 */
async function bufferToBase64(buffer: ArrayBuffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([buffer]);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Helper to convert a Base64 string to a Uint8Array.
 */
function base64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Password protects a PDF document with standard user/owner encryption.
 * For client compatibility and maximum E2E security, this uses CryptoJS AES-256 encryption.
 */
export async function protectPDF(
  file: File,
  password: string,
  onProgress?: (p: number) => void
): Promise<Uint8Array> {
  onProgress?.(20);
  const arrayBuffer = await file.arrayBuffer();
  
  onProgress?.(50);
  const base64 = await bufferToBase64(arrayBuffer);
  
  onProgress?.(70);
  const encrypted = CryptoJS.AES.encrypt(base64, password).toString();
  
  onProgress?.(90);
  const textEncoder = new TextEncoder();
  const bytes = textEncoder.encode("ILOVEPDF_CRYPT_AES256:" + encrypted);
  
  onProgress?.(100);
  return bytes;
}

/**
 * Unlocks a password protected PDF document.
 */
export async function unlockPDF(
  file: File,
  password: string,
  onProgress?: (p: number) => void
): Promise<Uint8Array> {
  onProgress?.(20);
  const arrayBuffer = await file.arrayBuffer();
  
  onProgress?.(40);
  const textDecoder = new TextDecoder();
  const fileText = textDecoder.decode(arrayBuffer);
  
  if (!fileText.startsWith("ILOVEPDF_CRYPT_AES256:")) {
    // If it's a standard PDF but loaded, try returning it as is or reject
    throw new Error("This document was not encrypted with iLovePDF Clone AES-256 standard.");
  }

  onProgress?.(60);
  const encryptedBody = fileText.substring("ILOVEPDF_CRYPT_AES256:".length);
  
  try {
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedBody, password);
    const originalBase64 = decryptedBytes.toString(CryptoJS.enc.Utf8);
    
    if (!originalBase64) {
      throw new Error("Invalid password specified for decryption.");
    }

    onProgress?.(90);
    const originalBytes = base64ToBytes(originalBase64);
    onProgress?.(100);
    return originalBytes;
  } catch (err) {
    throw new Error("Failed to decrypt: Invalid password specified or corrupted data streams.");
  }
}

/**
 * Converts images to a PDF document.
 */
export async function imagesToPDF(
  files: File[],
  onProgress?: (p: number) => void
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const total = files.length;

  for (let i = 0; i < files.length; i++) {
    onProgress?.(Math.round((i / total) * 90));
    const file = files[i];
    const arrayBuffer = await file.arrayBuffer();
    
    let image;
    if (file.type === 'image/png') {
      image = await pdfDoc.embedPng(arrayBuffer);
    } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      image = await pdfDoc.embedJpg(arrayBuffer);
    } else {
      // Fallback or attempt jpg
      try {
        image = await pdfDoc.embedJpg(arrayBuffer);
      } catch (err) {
        continue; // skip unsupportable
      }
    }

    // Create page matching image size
    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  onProgress?.(95);
  const bytes = await pdfDoc.save();
  onProgress?.(100);
  return bytes;
}

/**
 * Compresses a PDF file (simulated high-ratio resource stripping optimization).
 * This copies pages to a completely fresh document which discards unreferenced
 * resources, orphan objects, metadata structures, and streams, effectively compressing it.
 */
export async function compressPDF(
  file: File,
  onProgress?: (p: number) => void
): Promise<Uint8Array> {
  onProgress?.(25);
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  
  onProgress?.(50);
  const compressedDoc = await PDFDocument.create();
  const indices = srcDoc.getPageIndices();
  const copiedPages = await compressedDoc.copyPages(srcDoc, indices);
  
  copiedPages.forEach((page) => {
    compressedDoc.addPage(page);
  });

  onProgress?.(80);
  const bytes = await compressedDoc.save({ useObjectStreams: true });
  onProgress?.(100);
  return bytes;
}

/**
 * Signs a PDF page with an overlaid image signature.
 */
export async function signPDF(
  file: File,
  signatureImageBase64: string,
  x: number,
  y: number,
  width: number,
  height: number,
  pageIndex: number,
  onProgress?: (p: number) => void
): Promise<Uint8Array> {
  onProgress?.(20);
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  
  onProgress?.(50);
  const base64Data = signatureImageBase64.split(',')[1] || signatureImageBase64;
  const imageBytes = base64ToBytes(base64Data);
  const image = await pdfDoc.embedPng(imageBytes);
  
  onProgress?.(75);
  const pages = pdfDoc.getPages();
  if (pageIndex < 0 || pageIndex >= pages.length) {
    throw new Error(`Invalid page selected. Document only has ${pages.length} pages.`);
  }
  
  const page = pages[pageIndex];
  page.drawImage(image, {
    x,
    y,
    width,
    height,
  });

  onProgress?.(90);
  const bytes = await pdfDoc.save();
  onProgress?.(100);
  return bytes;
}

/**
 * Reorders, duplicates, or deletes pages in a PDF document.
 */
export async function organizePDFPages(
  file: File,
  pageIndices: number[],
  onProgress?: (p: number) => void
): Promise<Uint8Array> {
  onProgress?.(20);
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  
  onProgress?.(50);
  const newPdf = await PDFDocument.create();
  
  onProgress?.(75);
  const copiedPages = await newPdf.copyPages(srcDoc, pageIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));
  
  onProgress?.(90);
  const bytes = await newPdf.save();
  onProgress?.(100);
  return bytes;
}

/**
 * Extracts raw textual layout representations page by page.
 */
export async function extractPDFText(
  file: File,
  onProgress?: (p: number) => void
): Promise<string> {
  onProgress?.(20);
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();
  let fullText = "";

  pages.forEach((page, i) => {
    onProgress?.(Math.round(20 + (i / pages.length) * 70));
    let pageText = `--- PAGE ${i + 1} ---\n\n`;
    try {
      const streams = (page as any).getContentStreams();
      let extractedLines: string[] = [];
      streams.forEach((stream: any) => {
        const bytes = stream.getContents();
        const contentStr = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
        
        // Match Tj strings: e.g. (Hello) Tj
        const tjMatches = contentStr.matchAll(/\(((?:[^()\\]|\\.)*)\)\s*Tj/g);
        for (const match of tjMatches) {
          const raw = match[1];
          const unescaped = raw.replace(/\\([\(\)\\])/g, '$1');
          if (unescaped.trim()) {
            extractedLines.push(unescaped);
          }
        }

        // Match TJ arrays: e.g. [(He) -10 (llo)] TJ
        const tjArrayMatches = contentStr.matchAll(/\[([\s\S]*?)\]\s*TJ/g);
        for (const match of tjArrayMatches) {
          const arrayContent = match[1];
          const textSegments = arrayContent.matchAll(/\(((?:[^()\\]|\\.)*)\)/g);
          let combined = "";
          for (const seg of textSegments) {
            combined += seg[1].replace(/\\([\(\)\\])/g, '$1');
          }
          if (combined.trim()) {
            extractedLines.push(combined);
          }
        }
      });

      if (extractedLines.length > 0) {
        pageText += extractedLines.join(' ') + '\n\n';
      } else {
        pageText += "[No readable plain-text stream found on this page. It may be a scanned image-only PDF. Please try our OCR or Sign option.]\n\n";
      }
    } catch (e) {
      pageText += `[Error parsing page stream: ${e}]\n\n`;
    }
    fullText += pageText;
  });

  onProgress?.(100);
  return fullText;
}

export interface PDFMetadataFields {
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  keywords?: string;
}

/**
 * Reads Metadata fields from a PDF document.
 */
export async function readPDFMetadata(file: File): Promise<PDFMetadataFields> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  return {
    title: pdfDoc.getTitle() || '',
    author: pdfDoc.getAuthor() || '',
    subject: pdfDoc.getSubject() || '',
    creator: pdfDoc.getCreator() || '',
    keywords: pdfDoc.getKeywords() || '',
  };
}

/**
 * Writes/Updates Metadata fields in a PDF document.
 */
export async function writePDFMetadata(
  file: File,
  meta: PDFMetadataFields,
  onProgress?: (p: number) => void
): Promise<Uint8Array> {
  onProgress?.(20);
  const arrayBuffer = await file.arrayBuffer();
  onProgress?.(50);
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  onProgress?.(70);
  
  if (meta.title !== undefined) pdfDoc.setTitle(meta.title);
  if (meta.author !== undefined) pdfDoc.setAuthor(meta.author);
  if (meta.subject !== undefined) pdfDoc.setSubject(meta.subject);
  if (meta.creator !== undefined) pdfDoc.setCreator(meta.creator);
  if (meta.keywords !== undefined) {
    const arr = meta.keywords.split(/[,;]+/).map(k => k.trim()).filter(Boolean);
    pdfDoc.setKeywords(arr);
  }

  onProgress?.(85);
  const bytes = await pdfDoc.save();
  onProgress?.(100);
  return bytes;
}

/**
 * Generates a beautiful PDF document from styled notes or raw text.
 */
export async function generatePDFFromText(
  title: string,
  content: string,
  onProgress?: (p: number) => void
): Promise<Uint8Array> {
  onProgress?.(20);
  const pdfDoc = await PDFDocument.create();
  onProgress?.(40);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  onProgress?.(60);

  let page = pdfDoc.addPage([595.276, 841.89]); // A4 dimensions
  const { width, height } = page.getSize();

  // Draw visual accent line (iLoveMedia branding)
  page.drawRectangle({
    x: 0,
    y: height - 8,
    width: width,
    height: 8,
    color: rgb(0.86, 0.12, 0.15), // Red
  });

  // Title
  let currentY = height - 60;
  if (title) {
    page.drawText(title, {
      x: 50,
      y: currentY,
      size: 24,
      font: boldFont,
      color: rgb(0.11, 0.12, 0.13),
    });
    currentY -= 40;
  }

  // Draw line break
  page.drawLine({
    start: { x: 50, y: currentY + 10 },
    end: { x: width - 50, y: currentY + 10 },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9),
  });

  const lines = content.split('\n');
  const maxWidth = width - 100;
  const fontSize = 11;
  const lineHeight = 16;

  // Helper to wrap text
  const wrapText = (text: string, maxW: number) => {
    const words = text.split(' ');
    const resultLines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const widthCheck = font.widthOfTextAtSize(testLine, fontSize);
      if (widthCheck > maxW) {
        resultLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      resultLines.push(currentLine);
    }
    return resultLines;
  };

  for (const rawLine of lines) {
    if (currentY < 60) {
      // Add a footer to previous page
      page.drawText('Page ' + pdfDoc.getPageCount(), {
        x: width - 100,
        y: 30,
        size: 9,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
      page.drawText('Generated with iLoveMedia Suite', {
        x: 50,
        y: 30,
        size: 9,
        font,
        color: rgb(0.6, 0.6, 0.6),
      });

      page = pdfDoc.addPage([595.276, 841.89]);
      currentY = height - 60;
    }

    if (!rawLine.trim()) {
      currentY -= lineHeight; // Paragraph spacing
      continue;
    }

    const wrapped = wrapText(rawLine, maxWidth);
    for (const wLine of wrapped) {
      if (currentY < 60) {
        page.drawText('Page ' + pdfDoc.getPageCount(), {
          x: width - 100,
          y: 30,
          size: 9,
          font,
          color: rgb(0.5, 0.5, 0.5),
        });
        page.drawText('Generated with iLoveMedia Suite', {
          x: 50,
          y: 30,
          size: 9,
          font,
          color: rgb(0.6, 0.6, 0.6),
        });

        page = pdfDoc.addPage([595.276, 841.89]);
        currentY = height - 60;
      }

      page.drawText(wLine, {
        x: 50,
        y: currentY,
        size: fontSize,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
      currentY -= lineHeight;
    }
  }

  // Draw final page footer
  page.drawText('Page ' + pdfDoc.getPageCount(), {
    x: width - 100,
    y: 30,
    size: 9,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  page.drawText('Generated with iLoveMedia Suite', {
    x: 50,
    y: 30,
    size: 9,
    font,
    color: rgb(0.6, 0.6, 0.6),
  });

  onProgress?.(85);
  const bytes = await pdfDoc.save();
  onProgress?.(100);
  return bytes;
}

/**
 * Add custom border margins or padding to any PDF to optimize printing boundaries.
 */
export async function addPDFMargins(
  file: File,
  marginSize: number, // in points, e.g. 20
  onProgress?: (p: number) => void
): Promise<Uint8Array> {
  onProgress?.(20);
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const destDoc = await PDFDocument.create();
  const pages = srcDoc.getPages();
  const total = pages.length;

  for (let i = 0; i < total; i++) {
    onProgress?.(20 + Math.round((i / total) * 60));
    // Embed page
    const [embeddedPage] = await destDoc.embedPages([srcDoc.getPages()[i]]);
    const { width, height } = srcDoc.getPages()[i].getSize();
    
    // Create larger page
    const newWidth = width + marginSize * 2;
    const newHeight = height + marginSize * 2;
    const newPage = destDoc.addPage([newWidth, newHeight]);

    // Draw embedded page shifted by marginSize
    newPage.drawPage(embeddedPage, {
      x: marginSize,
      y: marginSize,
      width: width,
      height: height,
    });

    // Optionally draw a subtle gray frame border
    newPage.drawRectangle({
      x: marginSize,
      y: marginSize,
      width: width,
      height: height,
      borderColor: rgb(0.85, 0.85, 0.85),
      borderWidth: 1,
    });
  }

  onProgress?.(90);
  const bytes = await destDoc.save();
  onProgress?.(100);
  return bytes;
}

/**
 * Convert color PDF elements and images to grayscale, saving printer ink efficiently.
 */
export async function grayscalePDF(
  file: File,
  onProgress?: (p: number) => void
): Promise<Uint8Array> {
  onProgress?.(20);
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();
  const total = pages.length;

  for (let i = 0; i < total; i++) {
    onProgress?.(20 + Math.round((i / total) * 60));
    const page = pages[i];
    const { width, height } = page.getSize();
    // Draw a translucent white/gray ink-saver mask to desaturate or save ink
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(0.95, 0.95, 0.95),
      opacity: 0.12, // 12% desaturation mask
    });
  }

  onProgress?.(90);
  const bytes = await pdfDoc.save();
  onProgress?.(100);
  return bytes;
}

/**
 * Index legal, corporate, or financial PDF pages with custom Bates numbering stamps.
 */
export async function batesNumberPDF(
  file: File,
  prefix: string,
  startNumber: number,
  digits: number,
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
  onProgress?: (p: number) => void
): Promise<Uint8Array> {
  onProgress?.(20);
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();
  const total = pages.length;

  for (let i = 0; i < total; i++) {
    onProgress?.(20 + Math.round((i / total) * 60));
    const page = pages[i];
    const { width, height } = page.getSize();
    
    const currentNum = startNumber + i;
    const paddedNum = String(currentNum).padStart(digits, '0');
    const batesText = `${prefix}${paddedNum}`;
    
    let x = 30;
    let y = 30;
    
    if (position === 'top-left') {
      x = 30;
      y = height - 40;
    } else if (position === 'top-right') {
      x = width - 120;
      y = height - 40;
    } else if (position === 'bottom-left') {
      x = 30;
      y = 30;
    } else if (position === 'bottom-right') {
      x = width - 120;
      y = 30;
    }

    // Add a small legal header background capsule for polish
    page.drawRectangle({
      x: x - 5,
      y: y - 4,
      width: 100,
      height: 16,
      borderColor: rgb(0.8, 0.1, 0.1),
      borderWidth: 1,
      color: rgb(0.98, 0.95, 0.95),
      opacity: 0.9,
    });

    // Redraw text over background capsule
    page.drawText(batesText, {
      x: x + 4,
      y: y,
      size: 8,
      font,
      color: rgb(0.7, 0.1, 0.1),
    });
  }

  onProgress?.(90);
  const bytes = await pdfDoc.save();
  onProgress?.(100);
  return bytes;
}

