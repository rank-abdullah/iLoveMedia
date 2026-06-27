/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Combine, 
  Scissors, 
  RotateCw, 
  Binary, 
  FileDown, 
  Image, 
  Images, 
  Lock, 
  Unlock, 
  Sparkles,
  HelpCircle,
  FileSignature,
  FileText,
  LayoutGrid,
  Move,
  SunDim,
  Hash,
  Stamp,
  Sliders,
  FlipHorizontal
} from 'lucide-react';
import { PDFTool, PDFToolCategory } from '../types';

interface ToolGridProps {
  onSelectTool: (toolId: string) => void;
}

export const TOOLS_LIST: PDFTool[] = [
  // Organize (PDF)
  {
    id: 'merge',
    name: 'Merge PDF',
    description: 'Combine multiple PDF files into one single document in seconds.',
    category: 'organize',
    toolSuite: 'pdf',
    iconName: 'Combine',
    path: '/merge',
    inputType: '.pdf',
    outputType: '.pdf',
    isPremiumOnly: false,
  },
  {
    id: 'split',
    name: 'Split PDF',
    description: 'Extract specific pages or page ranges from a PDF into a new file.',
    category: 'organize',
    toolSuite: 'pdf',
    iconName: 'Scissors',
    path: '/split',
    inputType: '.pdf',
    outputType: '.pdf',
    isPremiumOnly: false,
  },
  {
    id: 'rotate',
    name: 'Rotate PDF',
    description: 'Rotate document pages clockwise or counter-clockwise at once.',
    category: 'organize',
    toolSuite: 'pdf',
    iconName: 'RotateCw',
    path: '/rotate',
    inputType: '.pdf',
    outputType: '.pdf',
    isPremiumOnly: false,
  },
  {
    id: 'page_numbers',
    name: 'Add Page Numbers',
    description: 'Add fully customizable styled page numbers dynamically to PDF pages.',
    category: 'organize',
    toolSuite: 'pdf',
    iconName: 'Binary',
    path: '/page-numbers',
    inputType: '.pdf',
    outputType: '.pdf',
    isPremiumOnly: false,
    isNew: true,
  },
  {
    id: 'organize_pages',
    name: 'Organize PDF Pages',
    description: 'Reorder, duplicate, or delete individual pages visually in a responsive layout grid.',
    category: 'organize',
    toolSuite: 'pdf',
    iconName: 'LayoutGrid',
    path: '/organize-pages',
    inputType: '.pdf',
    outputType: '.pdf',
    isPremiumOnly: false,
    isNew: true,
  },
  // Optimize (PDF)
  {
    id: 'compress',
    name: 'Compress PDF',
    description: 'Reduce the file size of your PDF while maintaining top visual quality.',
    category: 'optimize',
    toolSuite: 'pdf',
    iconName: 'FileDown',
    path: '/compress',
    inputType: '.pdf',
    outputType: '.pdf',
    isPremiumOnly: false,
  },
  // Convert (PDF)
  {
    id: 'jpg_to_pdf',
    name: 'JPG to PDF',
    description: 'Convert JPG, JPEG, and PNG images into a clean, custom PDF document.',
    category: 'convert',
    toolSuite: 'pdf',
    iconName: 'Images',
    path: '/jpg-to-pdf',
    inputType: 'image/*',
    outputType: '.pdf',
    isPremiumOnly: false,
  },
  {
    id: 'pdf_to_jpg',
    name: 'PDF to JPG',
    description: 'Extract pages of a PDF document as high-resolution images.',
    category: 'convert',
    toolSuite: 'pdf',
    iconName: 'Image',
    path: '/pdf-to-jpg',
    inputType: '.pdf',
    outputType: 'image/jpeg',
    isPremiumOnly: false,
  },
  {
    id: 'pdf_to_txt',
    name: 'PDF to Word / Text',
    description: 'Extract searchable text directly from any PDF and convert it to editable text format.',
    category: 'convert',
    toolSuite: 'pdf',
    iconName: 'FileText',
    path: '/pdf-to-txt',
    inputType: '.pdf',
    outputType: '.txt',
    isPremiumOnly: false,
    isNew: true,
  },
  // Security (PDF)
  {
    id: 'protect',
    name: 'Protect PDF',
    description: 'Encrypt and secure your PDFs with strong password-based AES encryption.',
    category: 'security',
    toolSuite: 'pdf',
    iconName: 'Lock',
    path: '/protect',
    inputType: '.pdf',
    outputType: '.pdf',
    isPremiumOnly: false,
  },
  {
    id: 'unlock',
    name: 'Unlock PDF',
    description: 'Remove password protection, letting you view and edit securely.',
    category: 'security',
    toolSuite: 'pdf',
    iconName: 'Unlock',
    path: '/unlock',
    inputType: '.pdf',
    outputType: '.pdf',
    isPremiumOnly: false,
  },
  {
    id: 'watermark',
    name: 'Watermark PDF',
    description: 'Overlay fully customized styled watermark text over all PDF pages.',
    category: 'security',
    toolSuite: 'pdf',
    iconName: 'Sparkles',
    path: '/watermark',
    inputType: '.pdf',
    outputType: '.pdf',
    isPremiumOnly: false,
  },
  {
    id: 'sign',
    name: 'Sign PDF',
    description: 'Draw, stamp, or upload your electronic signature easily onto any PDF page.',
    category: 'security',
    toolSuite: 'pdf',
    iconName: 'FileSignature',
    path: '/sign',
    inputType: '.pdf',
    outputType: '.pdf',
    isPremiumOnly: false,
    isNew: true,
  },

  // --- iLoveIMG Suite Tools ---
  {
    id: 'compress_img',
    name: 'Compress Image',
    description: 'Compress JPG, PNG, WEBP, or GIF files to reduce file size with optimal browser optimization.',
    category: 'optimize',
    toolSuite: 'image',
    iconName: 'FileDown',
    path: '/compress-img',
    inputType: 'image/*',
    outputType: 'image/*',
    isPremiumOnly: false,
    isNew: true,
  },
  {
    id: 'resize_img',
    name: 'Resize Image',
    description: 'Set custom width and height dimensions in pixels to resize images instantly.',
    category: 'organize',
    toolSuite: 'image',
    iconName: 'LayoutGrid',
    path: '/resize-img',
    inputType: 'image/*',
    outputType: 'image/*',
    isPremiumOnly: false,
    isNew: true,
  },
  {
    id: 'crop_img',
    name: 'Crop Image',
    description: 'Select precise coordinates to crop files to exact target pixel layouts.',
    category: 'organize',
    toolSuite: 'image',
    iconName: 'Scissors',
    path: '/crop-img',
    inputType: 'image/*',
    outputType: 'image/*',
    isPremiumOnly: false,
    isNew: true,
  },
  {
    id: 'rotate_img',
    name: 'Rotate Image',
    description: 'Rotate images perfectly clockwise or configure angle orientations.',
    category: 'organize',
    toolSuite: 'image',
    iconName: 'RotateCw',
    path: '/rotate-img',
    inputType: 'image/*',
    outputType: 'image/*',
    isPremiumOnly: false,
    isNew: true,
  },
  {
    id: 'convert_img',
    name: 'Convert Image Format',
    description: 'Convert raw, PNG, or GIF formats to JPEG or PNG in real-time.',
    category: 'convert',
    toolSuite: 'image',
    iconName: 'Images',
    path: '/convert-img',
    inputType: 'image/*',
    outputType: 'image/*',
    isPremiumOnly: false,
    isNew: true,
  },
  {
    id: 'meme_generator',
    name: 'Meme Generator',
    description: 'Upload any image, overlay styled caption texts at custom positions, and generate meme exports instantly.',
    category: 'convert',
    toolSuite: 'image',
    iconName: 'Sparkles',
    path: '/meme-generator',
    inputType: 'image/*',
    outputType: 'image/*',
    isPremiumOnly: false,
    isNew: true,
  },
  {
    id: 'html_to_pdf',
    name: 'Note to PDF',
    description: 'Write or paste rich styled notes and export them instantly as fully formatted high-quality PDF files.',
    category: 'convert',
    toolSuite: 'pdf',
    iconName: 'Combine',
    path: '/note-to-pdf',
    inputType: '.txt',
    outputType: '.pdf',
    isPremiumOnly: false,
    isNew: true,
  },
  {
    id: 'pdf_metadata',
    name: 'Edit PDF Metadata',
    description: 'View, edit, and apply custom PDF metadata labels (Title, Author, Subject, Keywords) seamlessly.',
    category: 'security',
    toolSuite: 'pdf',
    iconName: 'FileText',
    path: '/pdf-metadata',
    inputType: '.pdf',
    outputType: '.pdf',
    isPremiumOnly: false,
    isNew: true,
  },
  {
    id: 'pdf_margin',
    name: 'Add PDF Margins',
    description: 'Add custom border margins or padding to any PDF to optimize printing boundaries.',
    category: 'organize',
    toolSuite: 'pdf',
    iconName: 'Move',
    path: '/pdf-margins',
    inputType: '.pdf',
    outputType: '.pdf',
    isPremiumOnly: false,
    isNew: true,
  },
  {
    id: 'pdf_grayscale',
    name: 'Grayscale PDF',
    description: 'Convert color PDF elements and images to grayscale, saving printer ink efficiently.',
    category: 'optimize',
    toolSuite: 'pdf',
    iconName: 'SunDim',
    path: '/pdf-grayscale',
    inputType: '.pdf',
    outputType: '.pdf',
    isPremiumOnly: false,
    isNew: true,
  },
  {
    id: 'pdf_bates',
    name: 'Bates Numbering',
    description: 'Index legal, corporate, or financial PDF pages with custom Bates numbering stamps.',
    category: 'security',
    toolSuite: 'pdf',
    iconName: 'Hash',
    path: '/pdf-bates',
    inputType: '.pdf',
    outputType: '.pdf',
    isPremiumOnly: false,
    isNew: true,
  },
  {
    id: 'img_watermark',
    name: 'Add Image Watermark',
    description: 'Protect or brand images by overlaying transparent logos or custom texts over them.',
    category: 'security',
    toolSuite: 'image',
    iconName: 'Stamp',
    path: '/image-watermark',
    inputType: 'image/*',
    outputType: 'image/*',
    isPremiumOnly: false,
    isNew: true,
  },
  {
    id: 'img_filter',
    name: 'Image Filter & Enhancer',
    description: 'Instantly apply filters (grayscale, sepia, invert, blur, brightness) to enhance images in real-time.',
    category: 'optimize',
    toolSuite: 'image',
    iconName: 'Sliders',
    path: '/image-filter',
    inputType: 'image/*',
    outputType: 'image/*',
    isPremiumOnly: false,
    isNew: true,
  },
  {
    id: 'img_flip',
    name: 'Flip Image',
    description: 'Mirror images instantly by flipping them horizontally or vertically.',
    category: 'organize',
    toolSuite: 'image',
    iconName: 'FlipHorizontal',
    path: '/flip-image',
    inputType: 'image/*',
    outputType: 'image/*',
    isPremiumOnly: false,
    isNew: true,
  },
];

const renderIcon = (name: string, colorClass: string) => {
  const props = { className: `h-6 w-6 ${colorClass}` };
  switch (name) {
    case 'Combine': return <Combine {...props} />;
    case 'Scissors': return <Scissors {...props} />;
    case 'RotateCw': return <RotateCw {...props} />;
    case 'Binary': return <Binary {...props} />;
    case 'FileDown': return <FileDown {...props} />;
    case 'Images': return <Images {...props} />;
    case 'Image': return <Image {...props} />;
    case 'Lock': return <Lock {...props} />;
    case 'Unlock': return <Unlock {...props} />;
    case 'Sparkles': return <Sparkles {...props} />;
    case 'FileSignature': return <FileSignature {...props} />;
    case 'FileText': return <FileText {...props} />;
    case 'LayoutGrid': return <LayoutGrid {...props} />;
    case 'Move': return <Move {...props} />;
    case 'SunDim': return <SunDim {...props} />;
    case 'Hash': return <Hash {...props} />;
    case 'Stamp': return <Stamp {...props} />;
    case 'Sliders': return <Sliders {...props} />;
    case 'FlipHorizontal': return <FlipHorizontal {...props} />;
    default: return <HelpCircle {...props} />;
  }
};

const CATEGORIES: { id: PDFToolCategory; name: string; description: string; accent: string }[] = [
  { id: 'organize', name: 'Organize', description: 'Structure, merge, split, crop, resize, and rotate your files.', accent: 'text-blue-600 bg-blue-50 border-blue-100' },
  { id: 'optimize', name: 'Optimize', description: 'Compress and resize files for email or web upload.', accent: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  { id: 'convert', name: 'Convert', description: 'Convert format schemas and export file types effortlessly.', accent: 'text-purple-600 bg-purple-50 border-purple-100' },
  { id: 'security', name: 'Security', description: 'Protect, unlock, and brand document pages.', accent: 'text-red-600 bg-red-50 border-red-100' },
];

export default function ToolGrid({ onSelectTool }: ToolGridProps) {
  const [currentSuite, setCurrentSuite] = React.useState<'pdf' | 'image'>('pdf');

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Every file tool you need, <span className="text-red-600">in one place</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
          Merge, split, compress, crop, and convert your PDFs and images right in your browser.
          All operations are computed client-side with full local privacy.
        </p>
      </div>

      {/* Suite Selector Tabs */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex rounded-xl bg-gray-100 p-1">
          <button
            onClick={() => setCurrentSuite('pdf')}
            className={`flex items-center space-x-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all ${
              currentSuite === 'pdf'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>PDF Tools</span>
          </button>
          <button
            onClick={() => setCurrentSuite('image')}
            className={`flex items-center space-x-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all ${
              currentSuite === 'image'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Image className="h-4 w-4" />
            <span>Image Tools</span>
          </button>
        </div>
      </div>

      {/* Main categories section */}
      <div className="space-y-16">
        {CATEGORIES.map((cat) => {
          const catTools = TOOLS_LIST.filter((t) => t.category === cat.id && (t.toolSuite || 'pdf') === currentSuite);
          
          if (catTools.length === 0) return null;

          return (
            <div key={cat.id} className="space-y-6">
              {/* Category Title */}
              <div className="flex flex-col border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-3">
                  <span className={`rounded-xl px-3 py-1 text-xs font-bold tracking-wider uppercase border ${cat.accent}`}>
                    {currentSuite === 'pdf' ? `${cat.name} PDF` : `${cat.name} Image`}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{cat.description}</p>
              </div>

              {/* Tools Grid */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {catTools.map((tool) => {
                  let iconColorClass = currentSuite === 'pdf' ? 'text-red-500' : 'text-blue-500';
                  if (cat.id === 'organize') iconColorClass = currentSuite === 'pdf' ? 'text-blue-500' : 'text-blue-500';
                  if (cat.id === 'optimize') iconColorClass = currentSuite === 'pdf' ? 'text-emerald-500' : 'text-emerald-500';
                  if (cat.id === 'convert') iconColorClass = currentSuite === 'pdf' ? 'text-purple-500' : 'text-purple-500';

                  const hoverBorderColor = currentSuite === 'pdf' ? 'hover:border-red-300' : 'hover:border-blue-300';
                  const activeGradient = currentSuite === 'pdf' 
                    ? 'group-hover:from-red-500 group-hover:to-rose-400' 
                    : 'group-hover:from-blue-500 group-hover:to-indigo-400';

                  return (
                    <div
                      key={tool.id}
                      onClick={() => onSelectTool(tool.id)}
                      className={`group relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md ${hoverBorderColor} hover:-translate-y-0.5 transition-all duration-200 cursor-pointer`}
                    >
                      <div>
                        {/* Header icon + badges */}
                        <div className="flex items-center justify-between">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 group-hover:scale-110 transition-transform`}>
                            {renderIcon(tool.iconName, iconColorClass)}
                          </div>
                          <div className="flex space-x-1">
                            {tool.isNew && (
                              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-600 uppercase border border-blue-100">
                                New
                              </span>
                            )}
                            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-600 uppercase border border-emerald-100">
                              AES-256
                            </span>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <h3 className={`mt-4 text-base font-bold text-gray-900 ${currentSuite === 'pdf' ? 'group-hover:text-red-600' : 'group-hover:text-blue-600'} transition-colors`}>
                          {tool.name}
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-gray-500">
                          {tool.description}
                        </p>
                      </div>

                      {/* Accent highlight strip */}
                      <div className={`absolute inset-x-0 bottom-0 h-1.5 rounded-b-2xl bg-gradient-to-r from-transparent to-transparent ${activeGradient} transition-all duration-300`} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust Banner */}
      <div className="mt-20 rounded-3xl bg-gray-50 p-8 text-center border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Your files are processed locally</h2>
        <p className="mt-2 mx-auto max-w-xl text-xs leading-relaxed text-gray-500">
          All processing happens strictly inside your web browser. 
          Your files never touch third-party servers, guaranteeing total data confidentiality.
        </p>
      </div>
    </div>
  );
}
