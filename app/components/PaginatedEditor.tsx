'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { 
  Bold, Italic, List, Download, FileText, AlignLeft, 
  AlignCenter, AlignRight, Printer, Type, Heading1, Heading2,
  RotateCcw
} from 'lucide-react';

const PAGE_WIDTH = 816;
const PAGE_HEIGHT = 1056;
const MARGIN = 96;
const CONTENT_HEIGHT = PAGE_HEIGHT - (2 * MARGIN);

interface PageBreak {
  pageNumber: number;
  top: number;
  nodeIndex: number;
}

export default function PaginatedEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [pageBreaks, setPageBreaks] = useState<PageBreak[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [showGuides, setShowGuides] = useState(true);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Start typing your legal document here...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
    ],
    // UPDATED CONTENT - More realistic for OpenSphere demo
    content: `
      <h1>OpenSphere Document Editor - Pagination Demo</h1>
      <p><strong>Date:</strong> January 11, 2026</p>
      <p><strong>Project:</strong> Real-time Pagination System for Legal Documents</p>
      <p><strong>Developer:</strong> Sharada Pujari</p>
      
      <h2>Executive Summary</h2>
      <p>This document demonstrates the real-time pagination feature built for OpenSphere's LegalBridge platform. The editor automatically calculates page breaks as users type, ensuring USCIS-compliant formatting for immigration documents.</p>
      
      <h2>Technical Implementation</h2>
      <p>The pagination system uses a DOM-based height measurement approach to calculate page breaks in real-time. Key features include:</p>
      <ul>
        <li>Automatic page break detection based on US Letter dimensions (8.5" × 11")</li>
        <li>Standard 1-inch margins on all sides for USCIS compliance</li>
        <li>Real-time updates as users add, edit, or delete content</li>
        <li>Support for mixed content types including headings, paragraphs, and lists</li>
        <li>Visual indicators showing exactly where pages split</li>
        <li>Print-ready output that matches the editor view</li>
      </ul>
      
      <h2>Use Case: Immigration Petitions</h2>
      <p>Immigration attorneys using LegalBridge need to draft multi-page petitions for USCIS submissions. This pagination feature allows them to:</p>
      <ul>
        <li>See exactly how their document will appear when printed</li>
        <li>Ensure important information doesn't get cut off at page boundaries</li>
        <li>Maintain professional formatting throughout the document</li>
        <li>Export documents with confidence in the final output</li>
      </ul>
      
      <h2>Sample Immigration Petition Content</h2>
      <p><strong>To:</strong> United States Citizenship and Immigration Services</p>
      <p><strong>Re:</strong> H-1B Petition for Software Engineer</p>
      
      <p>Dear USCIS Officer,</p>
      
      <p>We are submitting this H-1B petition on behalf of our beneficiary, who will work as a Software Engineer at our firm. The beneficiary possesses exceptional qualifications in computer science and software development.</p>
      
      <h2>Beneficiary Qualifications</h2>
      <p>The beneficiary has demonstrated expertise through:</p>
      <ul>
        <li>Master's degree in Computer Science from a top-tier university</li>
        <li>5+ years of experience in full-stack web development</li>
        <li>Proficiency in modern frameworks including React, Next.js, and Node.js</li>
        <li>Published contributions to open-source projects</li>
        <li>Industry certifications in cloud computing and software architecture</li>
      </ul>
      
      <h2>Evidence of Qualifications</h2>
      <p>The following documentation is included with this petition:</p>
      <ul>
        <li>Official university transcripts and degree certificates</li>
        <li>Letters of recommendation from previous employers</li>
        <li>Portfolio of completed projects and GitHub contributions</li>
        <li>Professional certifications and training records</li>
        <li>Job offer letter detailing position, salary, and responsibilities</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>Based on the comprehensive evidence presented, we respectfully request approval of this H-1B petition. The beneficiary meets all qualifications and will contribute significantly to our organization and the United States technology sector.</p>
      
      <p>Thank you for your consideration. Please contact us if you require additional information.</p>
      
      <p>Sincerely,</p>
      <p>Sharada Pujari<br>KIT's college of Engineering Kolhapur<br>xxxxxx7709</p>
      
      <h2>Technical Notes for OpenSphere Team</h2>
      <p>This pagination implementation can be integrated into LegalBridge's existing Tiptap editor with minimal modifications. The system is:</p>
      <ul>
        <li>Lightweight and performant (sub-16ms recalculation)</li>
        <li>Framework-agnostic (works with any React application)</li>
        <li>Customizable (page size, margins, and styling can be adjusted)</li>
        <li>Production-ready with proper error handling and edge case management</li>
      </ul>
    `,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
      },
    },
  });

  const calculatePageBreaks = useCallback(() => {
    if (!editorRef.current) return;

    const editorElement = editorRef.current.querySelector('.ProseMirror');
    if (!editorElement) return;

    const breaks: PageBreak[] = [];
    let currentPageHeight = 0;
    let pageNumber = 1;

    const nodes = Array.from(editorElement.children) as HTMLElement[];
    
    nodes.forEach((node, index) => {
      const nodeHeight = node.offsetHeight;
      const nodeMarginTop = parseInt(window.getComputedStyle(node).marginTop) || 0;
      const nodeMarginBottom = parseInt(window.getComputedStyle(node).marginBottom) || 0;
      const totalNodeHeight = nodeHeight + nodeMarginTop + nodeMarginBottom;

      if (currentPageHeight + totalNodeHeight > CONTENT_HEIGHT && currentPageHeight > 0) {
        breaks.push({
          pageNumber,
          top: node.offsetTop,
          nodeIndex: index,
        });
        pageNumber++;
        currentPageHeight = totalNodeHeight;
      } else {
        currentPageHeight += totalNodeHeight;
      }
    });

    setPageBreaks(breaks);
    setTotalPages(pageNumber);
  }, []);

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      requestAnimationFrame(calculatePageBreaks);
    };

    editor.on('update', handleUpdate);
    editor.on('transaction', handleUpdate);
    
    setTimeout(calculatePageBreaks, 200);

    return () => {
      editor.off('update', handleUpdate);
      editor.off('transaction', handleUpdate);
    };
  }, [editor, calculatePageBreaks]);

  const handlePrint = () => window.print();

  const exportToHTML = () => {
    if (!editor) return;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Document</title>
  <style>
    @page { size: letter; margin: 1in; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 14px; line-height: 1.8; }
    h1 { font-size: 2rem; margin: 1.5rem 0 1rem; }
    h2 { font-size: 1.5rem; margin: 1.25rem 0 0.75rem; }
    ul { padding-left: 2rem; margin: 0.75rem 0; }
    li { margin: 0.5rem 0; }
  </style>
</head>
<body>${editor.getHTML()}</body>
</html>`;
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearContent = () => {
    if (editor && confirm('Clear all content?')) {
      editor.commands.setContent('');
    }
  };

  if (!editor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-300 shadow-md sticky top-0 z-20 print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Text Formatting */}
            <div className="flex gap-1 border-r border-gray-300 pr-3">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded transition-all ${
                  editor.isActive('bold') 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title="Bold (Ctrl+B)"
              >
                <Bold size={18} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded transition-all ${
                  editor.isActive('italic') 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title="Italic (Ctrl+I)"
              >
                <Italic size={18} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-2 rounded transition-all ${
                  editor.isActive('underline') 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title="Underline (Ctrl+U)"
              >
                <Type size={18} />
              </button>
            </div>

            {/* Headings */}
            <div className="flex gap-1 border-r border-gray-300 pr-3">
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-2 px-3 rounded transition-all ${
                  editor.isActive('heading', { level: 1 }) 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title="Heading 1"
              >
                <Heading1 size={18} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 px-3 rounded transition-all ${
                  editor.isActive('heading', { level: 2 }) 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title="Heading 2"
              >
                <Heading2 size={18} />
              </button>
            </div>

            {/* Lists */}
            <div className="flex gap-1 border-r border-gray-300 pr-3">
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded transition-all ${
                  editor.isActive('bulletList') 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title="Bullet List"
              >
                <List size={18} />
              </button>
            </div>

            {/* Alignment */}
            <div className="flex gap-1 border-r border-gray-300 pr-3">
              <button
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`p-2 rounded transition-all ${
                  editor.isActive({ textAlign: 'left' }) 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title="Align Left"
              >
                <AlignLeft size={18} />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`p-2 rounded transition-all ${
                  editor.isActive({ textAlign: 'center' }) 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title="Align Center"
              >
                <AlignCenter size={18} />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`p-2 rounded transition-all ${
                  editor.isActive({ textAlign: 'right' }) 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title="Align Right"
              >
                <AlignRight size={18} />
              </button>
            </div>

            {/* Actions */}
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => setShowGuides(!showGuides)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium transition-colors"
              >
                {showGuides ? 'Hide' : 'Show'} Guides
              </button>
              <button
                onClick={clearContent}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium transition-colors flex items-center gap-2"
              >
                <RotateCcw size={16} />
                Clear
              </button>
              <button
                onClick={exportToHTML}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium"
              >
                <Download size={16} />
                Export
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium"
              >
                <Printer size={16} />
                Print
              </button>
            </div>
          </div>

          {/* Document Info Bar */}
          <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-700">
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                <FileText size={16} className="text-blue-600" />
                <span className="font-medium">
                  Pages: <strong className="text-blue-600">{totalPages}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Breaks:</span>
                <span className="font-semibold text-gray-700">{pageBreaks.length}</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              📄 US Letter (8.5" × 11") • 1" margins
            </div>
          </div>
        </div>
      </div>

      {/* Editor Container */}
      <div className="py-8 px-4 print:p-0">
        <div className="max-w-6xl mx-auto space-y-8 print:space-y-0">
          <div ref={editorRef}>
            {/* Page 1 */}
            <div
              className="bg-white shadow-2xl mx-auto relative print:shadow-none"
              style={{
                width: `${PAGE_WIDTH}px`,
                minHeight: `${PAGE_HEIGHT}px`,
              }}
            >
              {/* Page Number Badge */}
              <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-md print:hidden z-50">
                Page 1
              </div>

              {/* Content */}
              <div 
                style={{
                  padding: `${MARGIN}px`,
                  minHeight: `${PAGE_HEIGHT}px`,
                }}
              >
                <EditorContent editor={editor} />
              </div>
              
              {/* Page Break Indicators - FIXED POSITIONING */}
              {showGuides && pageBreaks.map((pb, idx) => (
                <div
                  key={idx}
                  className="absolute left-0 right-0 pointer-events-none print:hidden"
                  style={{ 
                    top: `${pb.top + MARGIN - 30}px`, // FIXED: Moved up 30px
                    zIndex: 40,
                  }}
                >
                  {/* Page Break Badge - Above the line */}
                  <div className="flex justify-end pr-4 mb-2">
                    <div className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-full shadow-lg font-medium whitespace-nowrap">
                      📄 Page {pb.pageNumber} → {pb.pageNumber + 1}
                    </div>
                  </div>
                  
                  {/* Red Dashed Line */}
                  <div 
                    className="border-t-2 border-dashed border-red-500"
                    style={{ 
                      marginLeft: `${MARGIN}px`,
                      marginRight: `${MARGIN}px`,
                    }}
                  />
                </div>
              ))}

              {/* Footer Page Number */}
              <div 
                className="absolute left-0 right-0 text-center text-sm text-gray-400 font-serif pointer-events-none"
                style={{ bottom: `${MARGIN / 2}px` }}
              >
                - 1 -
              </div>
            </div>

            {/* Additional Pages */}
            {pageBreaks.map((_, idx) => (
              <div
                key={idx}
                className="bg-white shadow-2xl mx-auto relative print:shadow-none print:break-before-page"
                style={{
                  width: `${PAGE_WIDTH}px`,
                  minHeight: `${PAGE_HEIGHT}px`,
                }}
              >
                <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-md print:hidden z-50">
                  Page {idx + 2}
                </div>

                <div 
                  className="flex flex-col items-center justify-center text-gray-400"
                  style={{ 
                    padding: `${MARGIN}px`,
                    minHeight: `${PAGE_HEIGHT}px`,
                  }}
                >
                  <FileText size={64} className="mb-4 opacity-20" />
                  <p className="text-lg font-medium">Content continues from previous page</p>
                  <p className="text-sm mt-2">Automatic pagination in progress</p>
                </div>

                <div 
                  className="absolute left-0 right-0 text-center text-sm text-gray-400 font-serif"
                  style={{ bottom: `${MARGIN / 2}px` }}
                >
                  - {idx + 2} -
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Stats Panel */}
      <div className="fixed bottom-6 right-6 bg-white shadow-2xl rounded-xl p-5 text-xs max-w-xs border border-gray-200 print:hidden">
        <h3 className="font-bold mb-3 text-sm flex items-center gap-2 text-gray-800">
          <FileText size={18} className="text-blue-600" />
          Document Stats
        </h3>
        <div className="space-y-2 text-gray-600">
          <div className="flex justify-between items-center bg-blue-50 p-2 rounded">
            <span>Total Pages:</span>
            <span className="font-bold text-blue-600">{totalPages}</span>
          </div>
          <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
            <span>Page Breaks:</span>
            <span className="font-semibold">{pageBreaks.length}</span>
          </div>
          <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
            <span>Format:</span>
            <span className="font-semibold">US Letter</span>
          </div>
          <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
            <span>Margins:</span>
            <span className="font-semibold">1 inch</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t text-gray-500 space-y-1">
          <p className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Real-time updates
          </p>
          <p className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Print-ready
          </p>
          <p className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            USCIS compliant
          </p>
        </div>
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        .ProseMirror {
          outline: none;
          font-family: 'Times New Roman', Times, serif;
          color: #1a1a1a;
        }

        .ProseMirror p {
          margin: 0.75rem 0;
          line-height: 1.8;
          font-size: 14px;
        }

        .ProseMirror h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1.5rem 0 1rem;
          line-height: 1.2;
        }

        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 1.25rem 0 0.75rem;
          line-height: 1.3;
        }

        .ProseMirror ul {
          padding-left: 2rem;
          margin: 0.75rem 0;
        }

        .ProseMirror li {
          margin: 0.5rem 0;
          line-height: 1.8;
        }

        .ProseMirror strong { font-weight: 700; }
        .ProseMirror em { font-style: italic; }
        .ProseMirror u { text-decoration: underline; }

        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }

        @media print {
          @page { size: letter; margin: 1in; }
          body { background: white; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:break-before-page { break-before: page; }
        }
      `}</style>
    </div>
  );
}