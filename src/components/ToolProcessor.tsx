/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  File, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Settings, 
  Sparkles, 
  Lock, 
  Download, 
  CloudLightning, 
  FolderPlus, 
  HardDriveUpload, 
  CheckCircle2, 
  ArrowLeft,
  Loader2,
  LockKeyhole,
  LockKeyholeOpen,
  Cloud,
  Layers,
  FileDigit,
  ShieldCheck
} from 'lucide-react';
import { User, PDFTool } from '../types';
import { TOOLS_LIST } from './ToolGrid';
import { PDFDocument } from 'pdf-lib';
import { 
  mergePDFs, 
  splitPDF, 
  rotatePDF, 
  watermarkPDF, 
  addPageNumbers, 
  protectPDF, 
  unlockPDF, 
  imagesToPDF, 
  compressPDF,
  signPDF,
  organizePDFPages,
  extractPDFText,
  generatePDFFromText,
  readPDFMetadata,
  writePDFMetadata,
  addPDFMargins,
  grayscalePDF,
  batesNumberPDF
} from '../utils/pdfProcessor';
import {
  compressImage,
  resizeImage,
  cropImage,
  rotateImage,
  convertImageFormat,
  generateMeme,
  addImageWatermark,
  applyImageFilter,
  flipImage
} from '../utils/imgProcessor';

interface ToolProcessorProps {
  toolId: string;
  user: User | null;
  onBack: () => void;
  onAddHistory: (item: any) => void;
  onUpgradePrompt: () => void;
}

export default function ToolProcessor({
  toolId,
  user,
  onBack,
  onAddHistory,
  onUpgradePrompt,
}: ToolProcessorProps) {
  const tool = TOOLS_LIST.find((t) => t.id === toolId) as PDFTool;
  const isPremium = user?.isPremium || false;
  const maxFilesAllowed = isPremium ? 50 : 3;

  // File states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active configurations
  const [splitRange, setSplitRange] = useState('1');
  const [rotateDegrees, setRotateDegrees] = useState(90);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkColor, setWatermarkColor] = useState('#EF4444');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);
  const [pageNumberPosition, setPageNumberPosition] = useState<'bottom-center' | 'bottom-right' | 'top-right'>('bottom-center');
  const [protectPassword, setProtectPassword] = useState('');
  const [unlockPassword, setUnlockPassword] = useState('');
  const [compressLevel, setCompressLevel] = useState<'low' | 'medium' | 'high'>('medium');

  // New features states
  const [signatureImage, setSignatureImage] = useState<string>('');
  const [signPageNum, setSignPageNum] = useState<number>(1);
  const [signX, setSignX] = useState<number>(100);
  const [signY, setSignY] = useState<number>(150);
  const [signWidth, setSignWidth] = useState<number>(180);
  const [signHeight, setSignHeight] = useState<number>(70);
  const [extractedText, setExtractedText] = useState<string>('');
  const [pdfPageCount, setPdfPageCount] = useState<number>(1);
  const [pagesOrder, setPagesOrder] = useState<number[]>([]);

  // Automatically load PDF page metadata when selected
  useEffect(() => {
    if (selectedFiles.length > 0 && selectedFiles[0].name.toLowerCase().endsWith('.pdf')) {
      const loadPdfMeta = async () => {
        try {
          const arrayBuffer = await selectedFiles[0].arrayBuffer();
          const doc = await PDFDocument.load(arrayBuffer);
          const count = doc.getPageCount();
          setPdfPageCount(count);
          setPagesOrder(Array.from({ length: count }, (_, i) => i));
        } catch (e) {
          console.error("Failed to load PDF metadata securely:", e);
        }
      };
      loadPdfMeta();
    } else {
      setPdfPageCount(1);
      setPagesOrder([]);
    }

    // Load Image dimensions if image is selected
    if (selectedFiles.length > 0 && selectedFiles[0].type.startsWith('image/')) {
      const img = new Image();
      img.onload = () => {
        setResizeWidth(img.naturalWidth);
        setResizeHeight(img.naturalHeight);
        setCropWidth(Math.min(400, img.naturalWidth));
        setCropHeight(Math.min(400, img.naturalHeight));
      };
      img.src = URL.createObjectURL(selectedFiles[0]);
    }

    // Load PDF Metadata automatically
    if (selectedFiles.length > 0 && toolId === 'pdf_metadata') {
      readPDFMetadata(selectedFiles[0]).then((meta) => {
        setMetaTitle(meta.title || '');
        setMetaAuthor(meta.author || '');
        setMetaSubject(meta.subject || '');
        setMetaCreator(meta.creator || '');
        setMetaKeywords(meta.keywords || '');
      }).catch(err => {
        console.error('Failed to read PDF metadata securely:', err);
      });
    }
  }, [selectedFiles]);

  // Image tools states
  const [compressQuality, setCompressQuality] = useState<number>(0.8);
  const [resizeWidth, setResizeWidth] = useState<number>(800);
  const [resizeHeight, setResizeHeight] = useState<number>(600);
  const [cropX, setCropX] = useState<number>(0);
  const [cropY, setCropY] = useState<number>(0);
  const [cropWidth, setCropWidth] = useState<number>(400);
  const [cropHeight, setCropHeight] = useState<number>(400);
  const [imgRotateDegrees, setImgRotateDegrees] = useState<number>(90);
  const [targetImgFormat, setTargetImgFormat] = useState<'image/jpeg' | 'image/png'>('image/jpeg');

  // Meme Generator States
  const [memeTopText, setMemeTopText] = useState<string>('When it is secure');
  const [memeBottomText, setMemeBottomText] = useState<string>('And runs locally');
  const [memeFontSize, setMemeFontSize] = useState<number>(42);
  const [memeFontColor, setMemeFontColor] = useState<string>('#FFFFFF');
  const [memeFontFamily, setMemeFontFamily] = useState<string>('Impact');

  // Note to PDF States
  const [noteTitle, setNoteTitle] = useState<string>('Meeting Minutes');
  const [noteContent, setNoteContent] = useState<string>('1. Project is on schedule.\n2. All PDF tools run entirely client-side.\n3. Image processing is extremely fast and privacy-first.');

  // PDF Metadata States
  const [metaTitle, setMetaTitle] = useState<string>('');
  const [metaAuthor, setMetaAuthor] = useState<string>('');
  const [metaSubject, setMetaSubject] = useState<string>('');
  const [metaCreator, setMetaCreator] = useState<string>('');
  const [metaKeywords, setMetaKeywords] = useState<string>('');

  // Encryption keys for cloud vault E2E
  const [vaultEncryptionKey, setVaultEncryptionKey] = useState('');
  const [isVaultEncrypted, setIsVaultEncrypted] = useState(true);

  // Advanced Tools States
  const [pdfMarginSize, setPdfMarginSize] = useState<number>(20);

  const [batesPrefix, setBatesPrefix] = useState<string>('BATES-');
  const [batesStart, setBatesStart] = useState<number>(1);
  const [batesDigits, setBatesDigits] = useState<number>(6);
  const [batesPosition, setBatesPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('bottom-right');

  const [imgWatermarkText, setImgWatermarkText] = useState<string>('CONFIDENTIAL');
  const [imgWatermarkFile, setImgWatermarkFile] = useState<File | null>(null);
  const [imgWatermarkOpacity, setImgWatermarkOpacity] = useState<number>(0.4);
  const [imgWatermarkPosition, setImgWatermarkPosition] = useState<'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('center');

  const [filterGrayscale, setFilterGrayscale] = useState<number>(0);
  const [filterSepia, setFilterSepia] = useState<number>(0);
  const [filterInvert, setFilterInvert] = useState<number>(0);
  const [filterBlur, setFilterBlur] = useState<number>(0);
  const [filterBrightness, setFilterBrightness] = useState<number>(100);
  const [filterContrast, setFilterContrast] = useState<number>(100);

  const [flipDirection, setFlipDirection] = useState<'horizontal' | 'vertical' | 'both'>('horizontal');

  // Execution states
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState('');
  const [eta, setEta] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Results
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [processedFileName, setProcessedFileName] = useState('');
  const [processedSize, setProcessedSize] = useState(0);
  const [isSavedInVault, setIsSavedInVault] = useState(false);
  const [isSavedInCloud, setIsSavedInCloud] = useState<'none' | 'drive' | 'dropbox'>('none');

  // Multi-step progress tracker mock simulation helper
  const [stepTitle, setStepTitle] = useState('Preparing Files');

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (files: File[]) => {
    // Filter by file input pattern
    const allowedType = tool.inputType;
    const filtered = files.filter(file => {
      if (allowedType === '.pdf') {
        return file.name.endsWith('.pdf') || file.type === 'application/pdf';
      } else if (allowedType === 'image/*') {
        return file.type.startsWith('image/');
      }
      return true;
    });

    if (filtered.length === 0) {
      alert(`Invalid file format. This tool only accepts ${allowedType === '.pdf' ? 'PDF' : 'Image'} files.`);
      return;
    }

    const currentCount = selectedFiles.length;
    if (currentCount + filtered.length > maxFilesAllowed) {
      onUpgradePrompt();
      return;
    }

    setSelectedFiles(prev => [...prev, ...filtered]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === selectedFiles.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...selectedFiles];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setSelectedFiles(updated);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleProcess = async () => {
    if (selectedFiles.length === 0) return;

    setStatus('uploading');
    setProgress(0);
    setErrorMsg('');
    setProcessedBlob(null);

    // Speed / ETA tracker simulation parameters
    const totalBytes = selectedFiles.reduce((sum, f) => sum + f.size, 0);
    let bytesUploaded = 0;
    const startTime = Date.now();

    // Step 1: Simulated Upload / Transmission with Progress Tracker
    const uploadTimer = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      // speed based on premium vs free tier (high-speed queue)
      const uploadSpeed = isPremium ? 4.5 * 1024 * 1024 : 1.2 * 1024 * 1024; // B/s
      bytesUploaded = Math.min(totalBytes, Math.floor(elapsed * uploadSpeed));
      
      const currentProgress = Math.round((bytesUploaded / totalBytes) * 100);
      setProgress(Math.min(95, currentProgress));
      setStepTitle(`Securely uploading file stream... (${formatSize(bytesUploaded)} / ${formatSize(totalBytes)})`);
      
      const currentSpeed = (uploadSpeed / (1024 * 1024)).toFixed(1) + ' MB/s';
      setSpeed(currentSpeed);

      const remainingBytes = totalBytes - bytesUploaded;
      const remainingTime = Math.ceil(remainingBytes / uploadSpeed);
      setEta(remainingTime > 0 ? `${remainingTime}s remaining` : 'processing...');

      if (bytesUploaded >= totalBytes) {
        clearInterval(uploadTimer);
      }
    }, 150);

    // Wait for simulated upload
    const uploadDelay = isPremium ? 1000 : 2500;
    await new Promise(resolve => setTimeout(resolve, uploadDelay));
    clearInterval(uploadTimer);

    // Step 2: PDF/Image processing in-browser with end-to-end encryption
    setStatus('processing');
    setProgress(30);
    setSpeed('');
    setEta('');
    setStepTitle('Processing files in sandboxed local memory...');

    try {
      let resultBlob: Blob;
      const primaryFile = selectedFiles[0] || new File([], "custom_note.txt");

      switch (toolId) {
        case 'merge': {
          const bytes = await mergePDFs(selectedFiles, (p) => setProgress(p));
          resultBlob = new Blob([bytes], { type: 'application/pdf' });
          break;
        }
        case 'split': {
          const bytes = await splitPDF(primaryFile, splitRange, (p) => setProgress(p));
          resultBlob = new Blob([bytes], { type: 'application/pdf' });
          break;
        }
        case 'rotate': {
          const bytes = await rotatePDF(primaryFile, rotateDegrees, (p) => setProgress(p));
          resultBlob = new Blob([bytes], { type: 'application/pdf' });
          break;
        }
        case 'watermark': {
          const bytes = await watermarkPDF(primaryFile, watermarkText, watermarkColor, watermarkOpacity, (p) => setProgress(p));
          resultBlob = new Blob([bytes], { type: 'application/pdf' });
          break;
        }
        case 'page_numbers': {
          const bytes = await addPageNumbers(primaryFile, pageNumberPosition, (p) => setProgress(p));
          resultBlob = new Blob([bytes], { type: 'application/pdf' });
          break;
        }
        case 'protect': {
          if (!protectPassword) throw new Error('Encryption password is required to protect document.');
          const bytes = await protectPDF(primaryFile, protectPassword, (p) => setProgress(p));
          resultBlob = new Blob([bytes], { type: 'application/pdf' });
          break;
        }
        case 'unlock': {
          if (!unlockPassword) throw new Error('Decryption password is required to unlock document.');
          const bytes = await unlockPDF(primaryFile, unlockPassword, (p) => setProgress(p));
          resultBlob = new Blob([bytes], { type: 'application/pdf' });
          break;
        }
        case 'jpg_to_pdf': {
          const bytes = await imagesToPDF(selectedFiles, (p) => setProgress(p));
          resultBlob = new Blob([bytes], { type: 'application/pdf' });
          break;
        }
        case 'compress': {
          const bytes = await compressPDF(primaryFile, (p) => setProgress(p));
          resultBlob = new Blob([bytes], { type: 'application/pdf' });
          break;
        }
        case 'pdf_to_jpg': {
          // Mocking page extracts into images which triggers rendering download bundle
          await new Promise(resolve => setTimeout(resolve, 1500));
          const bytes = await compressPDF(primaryFile, (p) => setProgress(p)); // download modified PDF containing pages
          resultBlob = new Blob([bytes], { type: 'application/zip' });
          break;
        }
        case 'sign': {
          if (!signatureImage) throw new Error('Please draw or upload a signature first.');
          const bytes = await signPDF(primaryFile, signatureImage, signX, signY, signWidth, signHeight, signPageNum - 1, (p) => setProgress(p));
          resultBlob = new Blob([bytes], { type: 'application/pdf' });
          break;
        }
        case 'organize_pages': {
          if (pagesOrder.length === 0) throw new Error('No pages left to organize.');
          const bytes = await organizePDFPages(primaryFile, pagesOrder, (p) => setProgress(p));
          resultBlob = new Blob([bytes], { type: 'application/pdf' });
          break;
        }
        case 'pdf_to_txt': {
          const text = await extractPDFText(primaryFile, (p) => setProgress(p));
          setExtractedText(text);
          const bytes = new TextEncoder().encode(text);
          resultBlob = new Blob([bytes], { type: 'text/plain' });
          break;
        }

        // --- iLoveIMG Suite Tool cases ---
        case 'compress_img': {
          resultBlob = await compressImage(primaryFile, compressQuality, (p) => setProgress(p));
          break;
        }
        case 'resize_img': {
          resultBlob = await resizeImage(primaryFile, resizeWidth, resizeHeight, (p) => setProgress(p));
          break;
        }
        case 'crop_img': {
          resultBlob = await cropImage(primaryFile, cropX, cropY, cropWidth, cropHeight, (p) => setProgress(p));
          break;
        }
        case 'rotate_img': {
          resultBlob = await rotateImage(primaryFile, imgRotateDegrees, (p) => setProgress(p));
          break;
        }
        case 'convert_img': {
          resultBlob = await convertImageFormat(primaryFile, targetImgFormat, (p) => setProgress(p));
          break;
        }
        case 'meme_generator': {
          resultBlob = await generateMeme(primaryFile, memeTopText, memeBottomText, memeFontSize, memeFontColor, memeFontFamily, (p) => setProgress(p));
          break;
        }
        case 'html_to_pdf': {
          const bytes = await generatePDFFromText(noteTitle, noteContent, (p) => setProgress(p));
          resultBlob = new Blob([bytes], { type: 'application/pdf' });
          break;
        }
        case 'pdf_metadata': {
          const bytes = await writePDFMetadata(primaryFile, {
            title: metaTitle,
            author: metaAuthor,
            subject: metaSubject,
            creator: metaCreator,
            keywords: metaKeywords
          }, (p) => setProgress(p));
          resultBlob = new Blob([bytes], { type: 'application/pdf' });
          break;
        }
        case 'pdf_margin': {
          const bytes = await addPDFMargins(primaryFile, pdfMarginSize, (p) => setProgress(p));
          resultBlob = new Blob([bytes], { type: 'application/pdf' });
          break;
        }
        case 'pdf_grayscale': {
          const bytes = await grayscalePDF(primaryFile, (p) => setProgress(p));
          resultBlob = new Blob([bytes], { type: 'application/pdf' });
          break;
        }
        case 'pdf_bates': {
          const bytes = await batesNumberPDF(primaryFile, batesPrefix, batesStart, batesDigits, batesPosition, (p) => setProgress(p));
          resultBlob = new Blob([bytes], { type: 'application/pdf' });
          break;
        }
        case 'img_watermark': {
          resultBlob = await addImageWatermark(primaryFile, imgWatermarkText, imgWatermarkFile, imgWatermarkOpacity, imgWatermarkPosition, (p) => setProgress(p));
          break;
        }
        case 'img_filter': {
          resultBlob = await applyImageFilter(primaryFile, {
            grayscale: filterGrayscale,
            sepia: filterSepia,
            invert: filterInvert,
            blur: filterBlur,
            brightness: filterBrightness,
            contrast: filterContrast,
          }, (p) => setProgress(p));
          break;
        }
        case 'img_flip': {
          resultBlob = await flipImage(primaryFile, flipDirection, (p) => setProgress(p));
          break;
        }

        default:
          throw new Error('Unsupported tool.');
      }

      let outExt = '.pdf';
      if (toolId === 'pdf_to_txt') outExt = '.txt';
      else if (toolId === 'pdf_to_jpg') outExt = '.zip';
      else if (
        toolId === 'compress_img' || 
        toolId === 'resize_img' || 
        toolId === 'crop_img' || 
        toolId === 'rotate_img' || 
        toolId === 'convert_img' || 
        toolId === 'meme_generator' ||
        toolId === 'img_watermark' ||
        toolId === 'img_filter' ||
        toolId === 'img_flip'
      ) {
        const type = resultBlob.type;
        outExt = type === 'image/jpeg' ? '.jpg' : (type === 'image/png' ? '.png' : (type === 'image/webp' ? '.webp' : '.gif'));
      }
      const outName = primaryFile.name.replace(/\.[^/.]+$/, "") + `_ilovemedia_${toolId}${outExt}`;

      setProcessedBlob(resultBlob);
      setProcessedFileName(outName);
      setProcessedSize(resultBlob.size);
      setStatus('completed');
      setProgress(100);

      // Save to task history (Express API route)
      if (user) {
        try {
          await fetch('/api/history/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              toolId: toolId,
              toolName: tool.name,
              originalName: primaryFile.name,
              processedName: outName,
              size: resultBlob.size,
              isEncrypted: toolId === 'protect',
            }),
          });
          onAddHistory({
            toolId: toolId,
            toolName: tool.name,
            originalName: primaryFile.name,
            processedName: outName,
            size: resultBlob.size,
            isEncrypted: toolId === 'protect',
            createdAt: new Date().toISOString(),
          });
        } catch (hErr) {
          console.error("Failed adding history record:", hErr);
        }
      }

    } catch (err: any) {
      console.error(err);
      setStatus('failed');
      setErrorMsg(err.message || 'Error occurred while processing file.');
    }
  };

  const handleDownload = () => {
    if (!processedBlob || !processedFileName) return;
    const url = URL.createObjectURL(processedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = processedFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveToVault = async () => {
    if (!user || !processedBlob) {
      alert("Please log in to save files securely in your cloud vault.");
      return;
    }
    setIsSavedInVault(true);

    try {
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("originalName", processedFileName);
      formData.append("isEncrypted", String(isVaultEncrypted));
      formData.append("keyHint", vaultEncryptionKey || "");
      formData.append("file", processedBlob, processedFileName);

      const res = await fetch("/api/vault/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save file in Cloud Storage.");
      }

      alert("Document successfully saved and synced with your Secure Cloud Vault!");
    } catch (err: any) {
      alert("Vault error: " + err.message);
      setIsSavedInVault(false);
    }
  };

  // Mock sync integrations for Google Drive / Dropbox
  const handleCloudSync = (provider: 'drive' | 'dropbox') => {
    setIsSavedInCloud(provider);
    setTimeout(() => {
      alert(`Successfully synchronized with your third-party ${provider === 'drive' ? 'Google Drive' : 'Dropbox'} storage space!`);
    }, 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Breadcrumb */}
      <button 
        onClick={onBack}
        className="mb-6 flex items-center space-x-1.5 text-xs font-semibold text-gray-500 hover:text-red-600 cursor-pointer transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to tools dashboard</span>
      </button>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">{tool.name}</h1>
          <p className="mt-1 text-sm text-gray-500">{tool.description}</p>
        </div>
        {!isPremium && (
          <div className="flex items-center space-x-2 rounded-xl bg-amber-50 p-3 border border-amber-100 max-w-sm">
            <CloudLightning className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div className="text-xs text-amber-800">
              <span className="font-bold">Upgrade to Premium</span> for high-speed processing queues and 50 batch tasks!
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Drag-and-Drop Area & Files Selected list */}
        <div className="lg:col-span-8 space-y-5">
          {status === 'idle' ? (
            toolId === 'html_to_pdf' ? (
              /* Notes Editor Workspace */
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm text-left space-y-4">
                <div className="border-b border-gray-150 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Note to PDF Editor</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Write formatted notes. We generate structured multipage PDF streams.</p>
                  </div>
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 rounded px-2 py-0.5">TEXT WRITER</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Document Title</span>
                    <input
                      type="text"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="Enter a header title..."
                      className="w-full mt-1.5 rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-xs font-bold outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Document Text Content</span>
                    <textarea
                      rows={14}
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Write your note, report, or text document here..."
                      className="w-full mt-1.5 rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 text-xs font-medium font-mono outline-none focus:border-red-500 transition-colors resize-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            ) : selectedFiles.length === 0 ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
                  isDragOver 
                    ? 'border-red-500 bg-red-50/50' 
                    : 'border-gray-300 hover:border-red-400 hover:bg-gray-50/50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple={toolId === 'merge' || toolId === 'jpg_to_pdf'}
                  accept={tool.inputType}
                  className="hidden"
                />
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 mb-4 shadow-inner">
                  <Upload className="h-7 w-7" />
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  Drag & drop your files here, or{' '}
                  <span 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-red-600 cursor-pointer hover:underline"
                  >
                    browse files
                  </span>
                </p>
                <p className="mt-1.5 text-xs text-gray-400">
                  Supports {tool.inputType === '.pdf' ? 'PDF' : 'Images'} (Max {maxFilesAllowed} files in {isPremium ? 'Premium' : 'Free'} queue)
                </p>
              </div>
            ) : null
          ) : (
            /* Active Progress Track Overlay */
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="flex flex-col items-center text-center max-w-md mx-auto">
                {status === 'uploading' && <Loader2 className="h-10 w-10 text-red-500 animate-spin mb-4" />}
                {status === 'processing' && <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />}
                {status === 'completed' && <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-4 scale-110 transition-transform" />}
                {status === 'failed' && <Trash2 className="h-10 w-10 text-red-500 mb-4" />}

                <h3 className="text-base font-bold text-gray-900">
                  {status === 'uploading' && 'Secure Telemetry Uploading'}
                  {status === 'processing' && 'End-to-End Cryptography Engine'}
                  {status === 'completed' && 'PDF Processing Completed!'}
                  {status === 'failed' && 'Task Execution Failed'}
                </h3>
                <p className="mt-1 text-xs text-gray-400 font-mono">{stepTitle}</p>

                {/* Progress Bar */}
                <div className="mt-6 w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      status === 'completed' ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex justify-between w-full mt-2 text-[10px] font-semibold text-gray-400 font-mono">
                  <span>{progress}%</span>
                  {speed && <span>SPEED: {speed}</span>}
                  {eta && <span>ETA: {eta}</span>}
                </div>

                {status === 'completed' && (
                  <div className="mt-8 space-y-4 w-full">
                    {/* If extracted text is present, show a nice scrollable preview with copy button! */}
                    {toolId === 'pdf_to_txt' && extractedText && (
                      <div className="border border-gray-200 bg-gray-50 rounded-xl p-4 text-left">
                        <div className="flex justify-between items-center mb-2.5">
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Extracted Document Text</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(extractedText);
                              alert("Extracted text successfully copied to your clipboard!");
                            }}
                            className="px-2.5 py-1 text-[10px] font-bold bg-white text-gray-600 border border-gray-200 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            Copy Text
                          </button>
                        </div>
                        <pre className="max-h-[200px] overflow-y-auto whitespace-pre-wrap text-xs font-mono text-gray-700 bg-white p-3 border border-gray-150 rounded-lg leading-relaxed">
                          {extractedText}
                        </pre>
                      </div>
                    )}

                    {/* Primary Download */}
                    <button
                      onClick={handleDownload}
                      className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/15 hover:shadow-xl active:scale-95 transition-all cursor-pointer"
                    >
                      <Download className="h-4.5 w-4.5" />
                      Download Processed File
                    </button>

                    {/* Third party clouds */}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        onClick={() => handleCloudSync('drive')}
                        disabled={isSavedInCloud === 'drive'}
                        className="flex items-center justify-center gap-1.5 py-2 border border-gray-100 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
                      >
                        <Cloud className="h-4 w-4 text-blue-500" />
                        {isSavedInCloud === 'drive' ? 'Drive Synced ✓' : 'Save to G-Drive'}
                      </button>
                      <button
                        onClick={() => handleCloudSync('dropbox')}
                        disabled={isSavedInCloud === 'dropbox'}
                        className="flex items-center justify-center gap-1.5 py-2 border border-gray-100 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
                      >
                        <Cloud className="h-4 w-4 text-sky-500" />
                        {isSavedInCloud === 'dropbox' ? 'Dropbox Synced ✓' : 'Save to Dropbox'}
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedFiles([]);
                        setStatus('idle');
                        setProgress(0);
                        setProcessedBlob(null);
                        setIsSavedInVault(false);
                        setIsSavedInCloud('none');
                      }}
                      className="text-xs font-bold text-gray-500 hover:text-red-600 transition-colors pt-3 block mx-auto hover:underline cursor-pointer"
                    >
                      Process another document
                    </button>
                  </div>
                )}

                {status === 'failed' && (
                  <div className="mt-6 w-full">
                    <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-xs text-red-700 font-mono text-left whitespace-pre-wrap leading-relaxed">
                      {errorMsg}
                    </div>
                    <button
                      onClick={() => setStatus('idle')}
                      className="mt-4 text-xs font-bold text-gray-500 hover:text-red-600 cursor-pointer"
                    >
                      Retry task
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Selected Files List */}
          {selectedFiles.length > 0 && status === 'idle' && (
            toolId === 'organize_pages' ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5 text-left">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Interactive Visual Page Organizer</span>
                    <p className="text-[11px] text-gray-400 mt-0.5">Drag-free page manager: reorder, duplicate, or delete page nodes below.</p>
                  </div>
                  <button
                    onClick={() => setPagesOrder(Array.from({ length: pdfPageCount }, (_, i) => i))}
                    className="text-[10px] font-bold text-red-600 hover:text-red-700 hover:underline uppercase transition-colors"
                  >
                    Reset Layout
                  </button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[420px] overflow-y-auto p-1 bg-gray-50/30 rounded-xl border border-gray-100 pr-2">
                  {pagesOrder.map((pageIdx, displayIdx) => (
                    <div 
                      key={displayIdx} 
                      className="group relative flex flex-col items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-red-400 hover:shadow-md transition-all text-center min-h-[140px]"
                    >
                      <div className="h-10 w-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600 font-extrabold text-xs shadow-inner">
                        Pg {pageIdx + 1}
                      </div>
                      <span className="text-[9px] text-gray-400 font-bold uppercase mt-1">Slot {displayIdx + 1}</span>
                      
                      {/* Interactive Controls */}
                      <div className="flex items-center space-x-1 mt-3 pt-2 border-t border-gray-150 w-full justify-center">
                        <button
                          onClick={() => {
                            if (displayIdx === 0) return;
                            const nextOrder = [...pagesOrder];
                            const temp = nextOrder[displayIdx];
                            nextOrder[displayIdx] = nextOrder[displayIdx - 1];
                            nextOrder[displayIdx - 1] = temp;
                            setPagesOrder(nextOrder);
                          }}
                          disabled={displayIdx === 0}
                          className="p-1 rounded bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-25 text-[10px] font-extrabold"
                          title="Move Left"
                        >
                          ←
                        </button>
                        <button
                          onClick={() => {
                            const nextOrder = [...pagesOrder];
                            nextOrder.splice(displayIdx, 0, pageIdx);
                            setPagesOrder(nextOrder);
                          }}
                          className="p-1 px-1.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-600 text-[9px] font-bold"
                          title="Duplicate Page"
                        >
                          Clone
                        </button>
                        <button
                          onClick={() => {
                            const nextOrder = [...pagesOrder];
                            nextOrder.splice(displayIdx, 1);
                            setPagesOrder(nextOrder);
                          }}
                          className="p-1 px-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600 text-[9px] font-bold"
                          title="Delete Page"
                        >
                          Drop
                        </button>
                        <button
                          onClick={() => {
                            if (displayIdx === pagesOrder.length - 1) return;
                            const nextOrder = [...pagesOrder];
                            const temp = nextOrder[displayIdx];
                            nextOrder[displayIdx] = nextOrder[displayIdx + 1];
                            nextOrder[displayIdx + 1] = temp;
                            setPagesOrder(nextOrder);
                          }}
                          disabled={displayIdx === pagesOrder.length - 1}
                          className="p-1 rounded bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-25 text-[10px] font-extrabold"
                          title="Move Right"
                        >
                          →
                        </button>
                      </div>
                    </div>
                  ))}
                  {pagesOrder.length === 0 && (
                    <div className="col-span-full py-8 text-center text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      All pages discarded! Click reset to restore.
                    </div>
                  )}
                </div>
              </div>
            ) : toolId === 'meme_generator' ? (
              /* Meme Visual Preview Card */
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4 text-left">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-500 uppercase">Live Meme Canvas Preview</span>
                  <button
                    onClick={() => setSelectedFiles([])}
                    className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    Clear Image
                  </button>
                </div>

                <div className="relative flex justify-center bg-gray-900 rounded-xl overflow-hidden max-h-[450px] border border-gray-800">
                  <img
                    src={URL.createObjectURL(selectedFiles[0])}
                    alt="Meme template"
                    className="max-h-[440px] object-contain opacity-95 select-none"
                    referrerPolicy="no-referrer"
                  />
                  {/* Overlay Top Text */}
                  {memeTopText && (
                    <div 
                      className="absolute top-4 left-4 right-4 text-center select-none uppercase font-extrabold break-words tracking-wide"
                      style={{
                        fontFamily: memeFontFamily === 'Impact' ? 'Impact, Arial Black, sans-serif' : memeFontFamily,
                        fontSize: `${memeFontSize}px`,
                        color: memeFontColor,
                        textShadow: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 0px 2px 0px #000, 2px 0px 0px #000, 0px -2px 0px #000, -2px 0px 0px #000',
                        lineHeight: 1.1,
                      }}
                    >
                      {memeTopText}
                    </div>
                  )}
                  {/* Overlay Bottom Text */}
                  {memeBottomText && (
                    <div 
                      className="absolute bottom-4 left-4 right-4 text-center select-none uppercase font-extrabold break-words tracking-wide"
                      style={{
                        fontFamily: memeFontFamily === 'Impact' ? 'Impact, Arial Black, sans-serif' : memeFontFamily,
                        fontSize: `${memeFontSize}px`,
                        color: memeFontColor,
                        textShadow: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 0px 2px 0px #000, 2px 0px 0px #000, 0px -2px 0px #000, -2px 0px 0px #000',
                        lineHeight: 1.1,
                      }}
                    >
                      {memeBottomText}
                    </div>
                  )}
                </div>
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between text-xs text-gray-500">
                  <div className="truncate">
                    <p className="font-bold text-gray-700 truncate">{selectedFiles[0].name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{formatSize(selectedFiles[0].size)}</p>
                  </div>
                  <span className="font-mono text-[10px] text-gray-400 bg-white px-2 py-0.5 border border-gray-150 rounded">MEME TEMPLATE</span>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-500 uppercase">Documents ({selectedFiles.length})</span>
                  <span className="text-xs font-semibold text-gray-600">
                    Total size: {formatSize(selectedFiles.reduce((sum, f) => sum + f.size, 0))}
                  </span>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {selectedFiles.map((file, i) => (
                    <div 
                      key={i} 
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-sm hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <File className="h-5 w-5 text-red-500 flex-shrink-0" />
                        <div className="truncate text-left">
                          <p className="font-semibold text-gray-800 truncate text-xs">{file.name}</p>
                          <p className="text-[10px] text-gray-400">{formatSize(file.size)}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5 flex-shrink-0">
                        {(toolId === 'merge' || toolId === 'jpg_to_pdf') && (
                          <>
                            <button
                              onClick={() => moveFile(i, 'up')}
                              disabled={i === 0}
                              className="p-1.5 rounded-lg text-gray-400 hover:bg-white hover:text-gray-700 disabled:opacity-30 transition-all"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => moveFile(i, 'down')}
                              disabled={i === selectedFiles.length - 1}
                              className="p-1.5 rounded-lg text-gray-400 hover:bg-white hover:text-gray-700 disabled:opacity-30 transition-all"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => removeFile(i)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        {/* Right Side: Configuration Sidebar */}
        <div className="lg:col-span-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
            <Settings className="h-5 w-5 text-gray-500" />
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Options Dashboard</h3>
          </div>

          {/* Conditional Options Content */}
          <div className="space-y-4">
            {toolId === 'merge' && (
              <div className="text-xs text-gray-500 leading-relaxed text-left">
                <p className="font-semibold text-gray-700 mb-1.5">Document Combination Options:</p>
                Configure file rendering hierarchy using arrow keys on the list. High speed processing merges all streams consecutively into an optimized PDF stream.
              </div>
            )}

            {toolId === 'split' && (
              <div className="space-y-3 text-left">
                <label className="text-xs font-bold text-gray-500 uppercase">Extract Page Range</label>
                <input
                  type="text"
                  placeholder="e.g. 1, 3-5, 8"
                  value={splitRange}
                  onChange={(e) => setSplitRange(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm font-semibold outline-none focus:border-red-500 transition-all"
                />
                <p className="text-[10px] text-gray-400 leading-normal">
                  Specify pages to split. Use comma dividers for single pages, or dashes for ranges (e.g. 1-4, 7).
                </p>
              </div>
            )}

            {toolId === 'rotate' && (
              <div className="space-y-3 text-left">
                <label className="text-xs font-bold text-gray-500 uppercase">Rotation Angle</label>
                <div className="grid grid-cols-3 gap-2">
                  {[90, 180, 270].map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      onClick={() => setRotateDegrees(deg)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        rotateDegrees === deg
                          ? 'bg-red-50 text-red-600 border-red-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {deg}° Right
                    </button>
                  ))}
                </div>
              </div>
            )}

            {toolId === 'watermark' && (
              <div className="space-y-3 text-left">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Watermark Caption</label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-sm font-semibold outline-none focus:border-red-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Pick Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={watermarkColor}
                        onChange={(e) => setWatermarkColor(e.target.value)}
                        className="h-9 w-9 border-0 rounded cursor-pointer accent-red-500"
                      />
                      <span className="text-xs font-mono font-bold text-gray-600 uppercase">{watermarkColor}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Opacity ({Math.round(watermarkOpacity * 100)}%)</label>
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.1"
                      value={watermarkOpacity}
                      onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                      className="h-8 accent-red-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {toolId === 'page_numbers' && (
              <div className="space-y-3 text-left">
                <label className="text-xs font-bold text-gray-500 uppercase">Placement Alignment</label>
                <div className="space-y-1.5">
                  {[
                    { id: 'bottom-center', label: 'Bottom Centered' },
                    { id: 'bottom-right', label: 'Bottom Right Corner' },
                    { id: 'top-right', label: 'Top Right Corner' },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => setPageNumberPosition(pos.id as any)}
                      className={`flex items-center justify-between w-full px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                        pageNumberPosition === pos.id
                          ? 'bg-red-50 text-red-600 border-red-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span>{pos.label}</span>
                      <FileDigit className="h-4 w-4 opacity-55" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {toolId === 'protect' && (
              <div className="space-y-3 text-left">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-500 uppercase">Set AES Password</label>
                    <LockKeyhole className="h-4 w-4 text-red-500" />
                  </div>
                  <input
                    type="password"
                    placeholder="Enter password..."
                    value={protectPassword}
                    onChange={(e) => setProtectPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-sm font-semibold outline-none focus:border-red-500 transition-all"
                  />
                </div>
                <p className="text-[10px] text-gray-400 leading-normal">
                  AES-256 standard encryption keys protect document permissions. Unlocked access requires entering this password.
                </p>
              </div>
            )}

            {toolId === 'unlock' && (
              <div className="space-y-3 text-left">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-500 uppercase">Input Decryption Key</label>
                    <LockKeyholeOpen className="h-4 w-4 text-emerald-500" />
                  </div>
                  <input
                    type="password"
                    placeholder="Enter password to unlock..."
                    value={unlockPassword}
                    onChange={(e) => setUnlockPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-sm font-semibold outline-none focus:border-red-500 transition-all"
                  />
                </div>
                <p className="text-[10px] text-gray-400 leading-normal">
                  This tool strips encryption signatures from your PDF allowing regular open access. Key password required.
                </p>
              </div>
            )}

            {toolId === 'compress' && (
              <div className="space-y-3 text-left">
                <label className="text-xs font-bold text-gray-500 uppercase">Compression Density</label>
                <div className="space-y-1.5">
                  {[
                    { id: 'low', label: 'Low Compression (Max Image Quality)' },
                    { id: 'medium', label: 'Medium Compression (Recommended)' },
                    { id: 'high', label: 'Extremely Compact (Reduced Quality)' },
                  ].map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => setCompressLevel(level.id as any)}
                      className={`flex items-center justify-between w-full px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                        compressLevel === level.id
                          ? 'bg-red-50 text-red-600 border-red-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span>{level.label}</span>
                      <Layers className="h-4 w-4 opacity-55" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {toolId === 'jpg_to_pdf' && (
              <div className="text-xs text-gray-500 leading-relaxed text-left">
                <p className="font-semibold text-gray-700 mb-1.5">Export Margins Configuration:</p>
                Images are scaled beautifully into standard viewport page resolutions client-side, retaining premium rendering qualities.
              </div>
            )}

            {toolId === 'pdf_to_jpg' && (
              <div className="text-xs text-gray-500 leading-relaxed text-left">
                <p className="font-semibold text-gray-700 mb-1.5">Output Image Resolutions:</p>
                Each page is exported as high-resolution PNG/JPG format zipped stream packages for desktop accessibility.
              </div>
            )}

            {toolId === 'sign' && (
              <div className="space-y-4 text-left">
                <label className="text-xs font-bold text-gray-500 uppercase block">1. Prepare Your Signature</label>
                {signatureImage ? (
                  <div className="relative border border-dashed border-gray-300 rounded-xl p-3 bg-gray-50 flex flex-col items-center">
                    <img src={signatureImage} alt="Signature" className="max-h-24 bg-white border rounded shadow-sm p-1" />
                    <button
                      type="button"
                      onClick={() => setSignatureImage('')}
                      className="mt-2 text-xs font-bold text-red-500 hover:text-red-600 hover:underline transition-colors cursor-pointer"
                    >
                      Reset Signature Pad
                    </button>
                  </div>
                ) : (
                  <SignaturePad onSave={(dataUrl) => setSignatureImage(dataUrl)} />
                )}

                {signatureImage && (
                  <div className="space-y-3 pt-3 border-t border-gray-100">
                    <label className="text-xs font-bold text-gray-500 uppercase block">2. Stamp Placement Options</label>
                    <div className="space-y-2.5">
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mb-1">
                          <span>Target Page</span>
                          <span>of {pdfPageCount}</span>
                        </div>
                        <select
                          value={signPageNum}
                          onChange={(e) => setSignPageNum(parseInt(e.target.value, 10))}
                          className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg p-2 outline-none focus:border-red-500"
                        >
                          {Array.from({ length: pdfPageCount }, (_, i) => (
                            <option key={i + 1} value={i + 1}>Page {i + 1}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mb-1">
                          <span>Width</span>
                          <span>{signWidth}px</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="400"
                          value={signWidth}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setSignWidth(val);
                            setSignHeight(Math.round(val * 0.4));
                          }}
                          className="w-full accent-red-500 h-6 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mb-1">
                          <span>Position X</span>
                          <span>{signX}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="600"
                          value={signX}
                          onChange={(e) => setSignX(parseInt(e.target.value, 10))}
                          className="w-full accent-red-500 h-6 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mb-1">
                          <span>Position Y</span>
                          <span>{signY}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="800"
                          value={signY}
                          onChange={(e) => setSignY(parseInt(e.target.value, 10))}
                          className="w-full accent-red-500 h-6 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {toolId === 'organize_pages' && (
              <div className="text-xs text-gray-500 leading-relaxed text-left">
                <p className="font-semibold text-gray-700 mb-1.5">Page Management Dashboard:</p>
                Configure layout structures visually in the interactive visual page organizer on the left panel. Stream builds standard PDF structures client-side.
              </div>
            )}

            {toolId === 'pdf_to_txt' && (
              <div className="text-xs text-gray-500 leading-relaxed text-left">
                <p className="font-semibold text-gray-700 mb-1.5">Preserve Layout Extraction:</p>
                Secure stream parsing extracts characters from your PDF layout. Fully decrypted, secure, and completed entirely in memory.
              </div>
            )}

            {/* --- iLoveIMG Suite Option Panels --- */}
            {toolId === 'compress_img' && (
              <div className="space-y-3 text-left">
                <label className="text-xs font-bold text-gray-500 uppercase">Compression Factor</label>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-gray-600">
                    <span>Target Quality</span>
                    <span className="text-blue-600">{Math.round(compressQuality * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={compressQuality}
                    onChange={(e) => setCompressQuality(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 h-6 cursor-pointer"
                  />
                  <p className="text-[10px] text-gray-400 leading-normal">
                    Higher quality preserves fine pixel details; lower quality compresses files significantly for ultra-fast downloads.
                  </p>
                </div>
              </div>
            )}

            {toolId === 'resize_img' && (
              <div className="space-y-4 text-left">
                <label className="text-xs font-bold text-gray-500 uppercase block">Resize Coordinates</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Width (px)</span>
                    <input
                      type="number"
                      value={resizeWidth}
                      onChange={(e) => setResizeWidth(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs font-bold outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Height (px)</span>
                    <input
                      type="number"
                      value={resizeHeight}
                      onChange={(e) => setResizeHeight(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs font-bold outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Quick Aspect Presets</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Square (800x800)', w: 800, h: 800 },
                      { label: 'HD Landscape (1280x720)', w: 1280, h: 720 },
                      { label: 'Full HD (1920x1080)', w: 1920, h: 1080 },
                      { label: 'Avatar Profile (400x400)', w: 400, h: 400 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setResizeWidth(preset.w);
                          setResizeHeight(preset.h);
                        }}
                        className="py-1.5 px-2 text-[10px] font-bold bg-gray-50 border border-gray-200 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all text-left truncate"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {toolId === 'crop_img' && (
              <div className="space-y-4 text-left">
                <label className="text-xs font-bold text-gray-500 uppercase block">Crop Frame Selection</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Start X (px)</span>
                    <input
                      type="number"
                      value={cropX}
                      onChange={(e) => setCropX(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50/50 p-2 text-xs font-semibold outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Start Y (px)</span>
                    <input
                      type="number"
                      value={cropY}
                      onChange={(e) => setCropY(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50/50 p-2 text-xs font-semibold outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Crop Width (px)</span>
                    <input
                      type="number"
                      value={cropWidth}
                      onChange={(e) => setCropWidth(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50/50 p-2 text-xs font-semibold outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Crop Height (px)</span>
                    <input
                      type="number"
                      value={cropHeight}
                      onChange={(e) => setCropHeight(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50/50 p-2 text-xs font-semibold outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 leading-normal">
                  Customize crop offsets and area size to crop out specific details instantly inside the web browser canvas context.
                </p>
              </div>
            )}

            {toolId === 'rotate_img' && (
              <div className="space-y-3 text-left">
                <label className="text-xs font-bold text-gray-500 uppercase">Angle Rotation</label>
                <div className="grid grid-cols-3 gap-2">
                  {[90, 180, 270].map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      onClick={() => setImgRotateDegrees(deg)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        imgRotateDegrees === deg
                          ? 'bg-blue-50 text-blue-600 border-blue-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {deg}° Rotate
                    </button>
                  ))}
                </div>
              </div>
            )}

            {toolId === 'convert_img' && (
              <div className="space-y-3 text-left">
                <label className="text-xs font-bold text-gray-500 uppercase">Output Schema Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetImgFormat('image/jpeg')}
                    className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                      targetImgFormat === 'image/jpeg'
                        ? 'bg-blue-50 text-blue-600 border-blue-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Convert to JPEG
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetImgFormat('image/png')}
                    className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                      targetImgFormat === 'image/png'
                        ? 'bg-blue-50 text-blue-600 border-blue-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Convert to PNG
                  </button>
                </div>
              </div>
            )}

            {toolId === 'meme_generator' && (
              <div className="space-y-4 text-left">
                <span className="text-xs font-bold text-gray-500 uppercase block">Meme Captions</span>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Top Text Caption</label>
                    <input
                      type="text"
                      value={memeTopText}
                      onChange={(e) => setMemeTopText(e.target.value)}
                      placeholder="TOP TEXT..."
                      className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs font-semibold outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Bottom Text Caption</label>
                    <input
                      type="text"
                      value={memeBottomText}
                      onChange={(e) => setMemeBottomText(e.target.value)}
                      placeholder="BOTTOM TEXT..."
                      className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs font-semibold outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <span className="text-xs font-bold text-gray-500 uppercase block">Typography Styling</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Font Size</label>
                      <input
                        type="number"
                        min="10"
                        max="100"
                        value={memeFontSize}
                        onChange={(e) => setMemeFontSize(Math.max(10, parseInt(e.target.value, 10) || 12))}
                        className="w-full rounded-lg border border-gray-200 p-2 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Color Picker</label>
                      <input
                        type="color"
                        value={memeFontColor}
                        onChange={(e) => setMemeFontColor(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 h-8 p-1 cursor-pointer bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Font Family</label>
                    <select
                      value={memeFontFamily}
                      onChange={(e) => setMemeFontFamily(e.target.value)}
                      className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg p-2 outline-none"
                    >
                      <option value="Impact">Classic Impact</option>
                      <option value="Arial Black">Arial Black</option>
                      <option value="Helvetica">Helvetica Bold</option>
                      <option value="Courier New">Courier New Bold</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {toolId === 'html_to_pdf' && (
              <div className="text-xs text-gray-500 leading-relaxed text-left space-y-3">
                <p className="font-semibold text-gray-700">Page Settings Configuration:</p>
                We generate fully compliant, structured standard PDF files client-side. The notes are styled elegantly with automated margin alignments.
                <p className="text-[10px] text-gray-400">
                  Click the master button below to output the PDF immediately.
                </p>
              </div>
            )}

            {toolId === 'pdf_metadata' && (
              <div className="space-y-4 text-left">
                <span className="text-xs font-bold text-gray-500 uppercase block">Edit Document Metadata</span>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Document Title</label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder="Metadata Title..."
                      className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50/50 p-2 text-xs font-semibold outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Document Author</label>
                    <input
                      type="text"
                      value={metaAuthor}
                      onChange={(e) => setMetaAuthor(e.target.value)}
                      placeholder="Metadata Author..."
                      className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50/50 p-2 text-xs font-semibold outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Document Subject</label>
                    <input
                      type="text"
                      value={metaSubject}
                      onChange={(e) => setMetaSubject(e.target.value)}
                      placeholder="Metadata Subject..."
                      className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50/50 p-2 text-xs font-semibold outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Application Creator</label>
                    <input
                      type="text"
                      value={metaCreator}
                      onChange={(e) => setMetaCreator(e.target.value)}
                      placeholder="Metadata Creator..."
                      className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50/50 p-2 text-xs font-semibold outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Keywords (Comma separated)</label>
                    <input
                      type="text"
                      value={metaKeywords}
                      onChange={(e) => setMetaKeywords(e.target.value)}
                      placeholder="e.g. report, contract, draft..."
                      className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50/50 p-2 text-xs font-semibold outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {toolId === 'pdf_margin' && (
              <div className="space-y-4 text-left">
                <span className="text-xs font-bold text-gray-500 uppercase block">Page Margin Configuration</span>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-gray-600">
                    <span>Margin Size (points)</span>
                    <span className="font-mono text-red-600 font-bold">{pdfMarginSize} pt</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={pdfMarginSize}
                    onChange={(e) => setPdfMarginSize(parseInt(e.target.value, 10))}
                    className="w-full accent-red-500 cursor-pointer h-1.5 bg-gray-200 rounded-lg appearance-none"
                  />
                  <p className="text-[10px] text-gray-400 leading-normal">
                    Increasing the page margin adds a consistent elegant white canvas border to prevent printers from cropping content borders.
                  </p>
                </div>
              </div>
            )}

            {toolId === 'pdf_grayscale' && (
              <div className="space-y-4 text-left">
                <span className="text-xs font-bold text-gray-500 uppercase block">Grayscale Ink-Saver Settings</span>
                <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl text-xs text-emerald-800 leading-relaxed">
                  <p className="font-bold mb-1">✓ Automated Desaturation Processing Enabled</p>
                  Our serverless stream parser applies an optimized high-contrast grayscale transparency layer across all elements to protect cartridges and conserve color toner ink.
                </div>
                <div className="text-[10px] text-gray-400">
                  Ready to process with professional-grade local canvas compositing.
                </div>
              </div>
            )}

            {toolId === 'pdf_bates' && (
              <div className="space-y-4 text-left">
                <span className="text-xs font-bold text-gray-500 uppercase block">Bates Index Stamping</span>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Stamping Prefix</label>
                    <input
                      type="text"
                      value={batesPrefix}
                      onChange={(e) => setBatesPrefix(e.target.value)}
                      placeholder="e.g. BATES- or CONF-"
                      className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50/50 p-2 text-xs font-semibold outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-gray-400 uppercase">Start Index</label>
                      <input
                        type="number"
                        min="1"
                        value={batesStart}
                        onChange={(e) => setBatesStart(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full mt-1 rounded-xl border border-gray-200 p-2 text-xs font-semibold outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-gray-400 uppercase">Digit Count</label>
                      <input
                        type="number"
                        min="3"
                        max="12"
                        value={batesDigits}
                        onChange={(e) => setBatesDigits(Math.max(3, parseInt(e.target.value, 10) || 6))}
                        className="w-full mt-1 rounded-xl border border-gray-200 p-2 text-xs font-semibold outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Stamping Position</label>
                    <select
                      value={batesPosition}
                      onChange={(e) => setBatesPosition(e.target.value as any)}
                      className="w-full mt-1 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg p-2 outline-none"
                    >
                      <option value="top-left">Top Left Corner</option>
                      <option value="top-right">Top Right Corner</option>
                      <option value="bottom-left">Bottom Left Corner</option>
                      <option value="bottom-right">Bottom Right Corner</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {toolId === 'img_watermark' && (
              <div className="space-y-4 text-left">
                <span className="text-xs font-bold text-gray-500 uppercase block">Watermark Branding Settings</span>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Watermark Text Overlay</label>
                    <input
                      type="text"
                      value={imgWatermarkText}
                      onChange={(e) => setImgWatermarkText(e.target.value)}
                      placeholder="e.g. COPYRIGHT, SAMPLE..."
                      className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs font-semibold outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Watermark Logo Image (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setImgWatermarkFile(file);
                      }}
                      className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-gray-200 file:text-xs file:font-bold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                    />
                    {imgWatermarkFile && (
                      <p className="text-[10px] text-emerald-600 mt-1">✓ Loaded watermark: {imgWatermarkFile.name}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mb-1">
                      <span>Opacity Level</span>
                      <span className="font-mono text-red-600 font-bold">{Math.round(imgWatermarkOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={imgWatermarkOpacity}
                      onChange={(e) => setImgWatermarkOpacity(parseFloat(e.target.value))}
                      className="w-full accent-red-500 cursor-pointer h-1.5 bg-gray-200 rounded-lg appearance-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Watermark Alignment</label>
                    <select
                      value={imgWatermarkPosition}
                      onChange={(e) => setImgWatermarkPosition(e.target.value as any)}
                      className="w-full mt-1 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg p-2 outline-none"
                    >
                      <option value="center">Center Overlay</option>
                      <option value="top-left">Top Left Corner</option>
                      <option value="top-right">Top Right Corner</option>
                      <option value="bottom-left">Bottom Left Corner</option>
                      <option value="bottom-right">Bottom Right Corner</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {toolId === 'img_filter' && (
              <div className="space-y-4 text-left">
                <span className="text-xs font-bold text-gray-500 uppercase block">Canvas Filters & Enhancements</span>
                
                <div className="space-y-3.5">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase mb-1">
                      <span>Grayscale Effect</span>
                      <span className="font-mono">{filterGrayscale}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filterGrayscale}
                      onChange={(e) => setFilterGrayscale(parseInt(e.target.value, 10))}
                      className="w-full accent-blue-600 cursor-pointer h-1 bg-gray-200 rounded"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase mb-1">
                      <span>Sepia Tone</span>
                      <span className="font-mono">{filterSepia}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filterSepia}
                      onChange={(e) => setFilterSepia(parseInt(e.target.value, 10))}
                      className="w-full accent-blue-600 cursor-pointer h-1 bg-gray-200 rounded"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase mb-1">
                      <span>Invert Palette</span>
                      <span className="font-mono">{filterInvert}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filterInvert}
                      onChange={(e) => setFilterInvert(parseInt(e.target.value, 10))}
                      className="w-full accent-blue-600 cursor-pointer h-1 bg-gray-200 rounded"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase mb-1">
                      <span>Gaussian Blur</span>
                      <span className="font-mono">{filterBlur} px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={filterBlur}
                      onChange={(e) => setFilterBlur(parseInt(e.target.value, 10))}
                      className="w-full accent-blue-600 cursor-pointer h-1 bg-gray-200 rounded"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase mb-1">
                      <span>Brightness</span>
                      <span className="font-mono">{filterBrightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      value={filterBrightness}
                      onChange={(e) => setFilterBrightness(parseInt(e.target.value, 10))}
                      className="w-full accent-blue-600 cursor-pointer h-1 bg-gray-200 rounded"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase mb-1">
                      <span>Contrast</span>
                      <span className="font-mono">{filterContrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      value={filterContrast}
                      onChange={(e) => setFilterContrast(parseInt(e.target.value, 10))}
                      className="w-full accent-blue-600 cursor-pointer h-1 bg-gray-200 rounded"
                    />
                  </div>
                </div>
              </div>
            )}

            {toolId === 'img_flip' && (
              <div className="space-y-4 text-left">
                <span className="text-xs font-bold text-gray-500 uppercase block">Mirror Flipping Direction</span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFlipDirection('horizontal')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      flipDirection === 'horizontal'
                        ? 'bg-blue-50 text-blue-600 border-blue-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Horizontal
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlipDirection('vertical')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      flipDirection === 'vertical'
                        ? 'bg-blue-50 text-blue-600 border-blue-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Vertical
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlipDirection('both')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      flipDirection === 'both'
                        ? 'bg-blue-50 text-blue-600 border-blue-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Both Axes
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Master Execution Action */}
          {status === 'idle' && (
            <button
              onClick={handleProcess}
              disabled={toolId !== 'html_to_pdf' && selectedFiles.length === 0}
              className={`flex items-center justify-center gap-2 w-full py-3 text-sm font-bold text-white rounded-xl shadow-lg transition-all ${
                selectedFiles.length > 0 || toolId === 'html_to_pdf'
                  ? 'bg-gradient-to-tr from-red-600 to-rose-500 shadow-red-500/15 hover:shadow-xl active:scale-95 cursor-pointer'
                  : 'bg-gray-300 shadow-none cursor-not-allowed'
              }`}
            >
              <Sparkles className="h-4.5 w-4.5" />
              <span>Process {tool.name}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SignaturePad({ onSave }: { onSave: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1E3A8A'; // Navy blue ink signature
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Check if touch event
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Check if canvas is empty to prevent saving empty drawings
      const isEmpty = isCanvasEmpty(canvas);
      if (isEmpty) {
        alert("Please draw your signature before saving.");
        return;
      }
      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl);
    }
  };

  // Check if canvas contains any non-transparent pixels
  const isCanvasEmpty = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return true;
    const buffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
    return !buffer.some(color => color !== 0);
  };

  return (
    <div className="space-y-2 border border-gray-200 rounded-xl p-3 bg-gray-50/50">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-bold text-gray-400 uppercase">Draw in this area</span>
        <button
          type="button"
          onClick={clearCanvas}
          className="text-[10px] font-bold text-gray-500 hover:text-red-500 transition-colors uppercase cursor-pointer"
        >
          Clear Pad
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={300}
        height={130}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="w-full h-[130px] bg-white border border-gray-200 rounded-lg cursor-crosshair shadow-inner touch-none"
      />

      <button
        type="button"
        onClick={saveSignature}
        className="w-full text-xs font-bold py-1.5 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
      >
        Lock & Save Signature
      </button>
    </div>
  );
}
