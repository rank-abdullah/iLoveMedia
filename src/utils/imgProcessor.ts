/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Helper to load an image File or blob into an HTMLImageElement
 */
function loadImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to parse image file.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image stream.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Compress an image using canvas compression quality (for JPEG/WEBP).
 */
export async function compressImage(
  file: File,
  quality: number, // 0.1 to 1.0
  onProgress?: (p: number) => void
): Promise<Blob> {
  onProgress?.(30);
  const img = await loadImage(file);
  onProgress?.(60);

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create 2D canvas context.');

  ctx.drawImage(img, 0, 0);
  onProgress?.(85);

  return new Promise((resolve, reject) => {
    // If output type isn't jpeg/webp, convert it to jpeg to support compression
    const mime = file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/webp'
      ? file.type
      : 'image/jpeg';

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onProgress?.(100);
          resolve(blob);
        } else {
          reject(new Error('Failed to compress image data.'));
        }
      },
      mime,
      quality
    );
  });
}

/**
 * Resize an image to new dimensions.
 */
export async function resizeImage(
  file: File,
  width: number,
  height: number,
  onProgress?: (p: number) => void
): Promise<Blob> {
  onProgress?.(30);
  const img = await loadImage(file);
  onProgress?.(60);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create 2D canvas context.');

  ctx.drawImage(img, 0, 0, width, height);
  onProgress?.(85);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onProgress?.(100);
          resolve(blob);
        } else {
          reject(new Error('Failed to resize image.'));
        }
      },
      file.type || 'image/png'
    );
  });
}

/**
 * Crop an image using rect coordinates.
 */
export async function cropImage(
  file: File,
  cropX: number,
  cropY: number,
  cropWidth: number,
  cropHeight: number,
  onProgress?: (p: number) => void
): Promise<Blob> {
  onProgress?.(30);
  const img = await loadImage(file);
  onProgress?.(60);

  const canvas = document.createElement('canvas');
  canvas.width = cropWidth;
  canvas.height = cropHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create 2D canvas context.');

  // draw subset of image
  ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
  onProgress?.(85);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onProgress?.(100);
          resolve(blob);
        } else {
          reject(new Error('Failed to crop image.'));
        }
      },
      file.type || 'image/png'
    );
  });
}

/**
 * Rotate an image by specified degrees.
 */
export async function rotateImage(
  file: File,
  degrees: number,
  onProgress?: (p: number) => void
): Promise<Blob> {
  onProgress?.(30);
  const img = await loadImage(file);
  onProgress?.(60);

  const canvas = document.createElement('canvas');
  const angleRad = (degrees * Math.PI) / 180;
  
  // Calculate new bounding box dimensions
  const absCos = Math.abs(Math.cos(angleRad));
  const absSin = Math.abs(Math.sin(angleRad));
  const newWidth = img.naturalWidth * absCos + img.naturalHeight * absSin;
  const newHeight = img.naturalWidth * absSin + img.naturalHeight * absCos;

  canvas.width = Math.round(newWidth);
  canvas.height = Math.round(newHeight);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create 2D canvas context.');

  // Translate to center, rotate, translate back
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(angleRad);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  onProgress?.(85);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onProgress?.(100);
          resolve(blob);
        } else {
          reject(new Error('Failed to rotate image.'));
        }
      },
      file.type || 'image/png'
    );
  });
}

/**
 * Convert any image format to JPEG or PNG.
 */
export async function convertImageFormat(
  file: File,
  targetFormat: 'image/jpeg' | 'image/png',
  onProgress?: (p: number) => void
): Promise<Blob> {
  onProgress?.(30);
  const img = await loadImage(file);
  onProgress?.(60);

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create 2D canvas context.');

  // Fill white background for JPEG exports if original has alpha
  if (targetFormat === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);
  onProgress?.(85);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onProgress?.(100);
          resolve(blob);
        } else {
          reject(new Error('Conversion failed.'));
        }
      },
      targetFormat,
      targetFormat === 'image/jpeg' ? 0.95 : undefined
    );
  });
}

/**
 * Generate a custom meme with overlaid top and bottom texts with outline stroke.
 */
export async function generateMeme(
  file: File,
  topText: string,
  bottomText: string,
  fontSize: number,
  fontColor: string,
  fontFamily: string,
  onProgress?: (p: number) => void
): Promise<Blob> {
  onProgress?.(30);
  const img = await loadImage(file);
  onProgress?.(60);

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create 2D canvas context.');

  // Draw base image
  ctx.drawImage(img, 0, 0);
  onProgress?.(80);

  // Setup text properties
  ctx.fillStyle = fontColor;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = Math.max(2, Math.round(fontSize / 8));
  ctx.textAlign = 'center';
  ctx.font = `bold ${fontSize}px ${fontFamily}`;

  // Draw Top Text
  if (topText) {
    ctx.textBaseline = 'top';
    const topY = Math.round(canvas.height * 0.05);
    ctx.strokeText(topText.toUpperCase(), canvas.width / 2, topY);
    ctx.fillText(topText.toUpperCase(), canvas.width / 2, topY);
  }

  // Draw Bottom Text
  if (bottomText) {
    ctx.textBaseline = 'bottom';
    const bottomY = Math.round(canvas.height * 0.95);
    ctx.strokeText(bottomText.toUpperCase(), canvas.width / 2, bottomY);
    ctx.fillText(bottomText.toUpperCase(), canvas.width / 2, bottomY);
  }

  onProgress?.(95);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onProgress?.(100);
          resolve(blob);
        } else {
          reject(new Error('Failed to render meme canvas.'));
        }
      },
      file.type || 'image/png'
    );
  });
}

/**
 * Protect or brand images by overlaying transparent logos or custom texts over them.
 */
export async function addImageWatermark(
  file: File,
  watermarkText: string,
  watermarkImageFile: File | null,
  opacity: number, // 0 to 1
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
  onProgress?: (p: number) => void
): Promise<Blob> {
  onProgress?.(20);
  const img = await loadImage(file);
  onProgress?.(50);

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create 2D canvas context.');

  // Draw base image
  ctx.drawImage(img, 0, 0);

  // Prepare to draw watermark with transparency
  ctx.save();
  ctx.globalAlpha = opacity;

  let x = canvas.width / 2;
  let y = canvas.height / 2;
  const padding = Math.min(canvas.width, canvas.height) * 0.05;

  if (watermarkImageFile) {
    const markImg = await loadImage(watermarkImageFile);
    const scale = 0.25; // watermark is 25% of background width max
    let markW = markImg.naturalWidth;
    let markH = markImg.naturalHeight;
    const maxW = canvas.width * scale;
    if (markW > maxW) {
      const ratio = maxW / markW;
      markW = maxW;
      markH = markH * ratio;
    }

    if (position === 'center') {
      x = (canvas.width - markW) / 2;
      y = (canvas.height - markH) / 2;
    } else if (position === 'top-left') {
      x = padding;
      y = padding;
    } else if (position === 'top-right') {
      x = canvas.width - markW - padding;
      y = padding;
    } else if (position === 'bottom-left') {
      x = padding;
      y = canvas.height - markH - padding;
    } else if (position === 'bottom-right') {
      x = canvas.width - markW - padding;
      y = canvas.height - markH - padding;
    }

    ctx.drawImage(markImg, x, y, markW, markH);
  } else if (watermarkText) {
    // Draw Text Watermark
    const fontSize = Math.max(16, Math.round(canvas.width * 0.04));
    ctx.font = `bold ${fontSize}px Helvetica, Arial, sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(1, Math.round(fontSize / 10));

    if (position === 'center') {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
    } else if (position === 'top-left') {
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      x = padding;
      y = padding;
    } else if (position === 'top-right') {
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      x = canvas.width - padding;
      y = padding;
    } else if (position === 'bottom-left') {
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      x = padding;
      y = canvas.height - padding;
    } else if (position === 'bottom-right') {
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      x = canvas.width - padding;
      y = canvas.height - padding;
    }

    ctx.strokeText(watermarkText, x, y);
    ctx.fillText(watermarkText, x, y);
  }

  ctx.restore();
  onProgress?.(85);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onProgress?.(100);
          resolve(blob);
        } else {
          reject(new Error('Watermark processing failed.'));
        }
      },
      file.type || 'image/png'
    );
  });
}

/**
 * Instantly apply filters (grayscale, sepia, invert, blur, brightness) to enhance images in real-time.
 */
export async function applyImageFilter(
  file: File,
  filters: {
    grayscale: number; // 0 to 100
    sepia: number; // 0 to 100
    invert: number; // 0 to 100
    blur: number; // 0 to 10
    brightness: number; // 50 to 200
    contrast: number; // 50 to 200
  },
  onProgress?: (p: number) => void
): Promise<Blob> {
  onProgress?.(30);
  const img = await loadImage(file);
  onProgress?.(60);

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create 2D canvas context.');

  // Build filter string
  const parts = [
    `grayscale(${filters.grayscale}%)`,
    `sepia(${filters.sepia}%)`,
    `invert(${filters.invert}%)`,
    `blur(${filters.blur}px)`,
    `brightness(${filters.brightness}%)`,
    `contrast(${filters.contrast}%)`,
  ];
  ctx.filter = parts.join(' ');

  ctx.drawImage(img, 0, 0);
  onProgress?.(85);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onProgress?.(100);
          resolve(blob);
        } else {
          reject(new Error('Filter application failed.'));
        }
      },
      file.type || 'image/png'
    );
  });
}

/**
 * Mirror images instantly by flipping them horizontally or vertically.
 */
export async function flipImage(
  file: File,
  direction: 'horizontal' | 'vertical' | 'both',
  onProgress?: (p: number) => void
): Promise<Blob> {
  onProgress?.(30);
  const img = await loadImage(file);
  onProgress?.(60);

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create 2D canvas context.');

  ctx.save();
  
  // Scale appropriately to mirror
  if (direction === 'horizontal') {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  } else if (direction === 'vertical') {
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);
  } else if (direction === 'both') {
    ctx.translate(canvas.width, canvas.height);
    ctx.scale(-1, -1);
  }

  ctx.drawImage(img, 0, 0);
  ctx.restore();
  onProgress?.(85);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onProgress?.(100);
          resolve(blob);
        } else {
          reject(new Error('Flip image failed.'));
        }
      },
      file.type || 'image/png'
    );
  });
}


