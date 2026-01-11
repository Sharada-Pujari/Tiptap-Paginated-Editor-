# Tiptap Paginated Document Editor

A production-ready document editor with real-time pagination for legal documents, built for OpenSphere's immigration workflow platform.

## 🚀 Live Demo

**Live URL:** [Your Vercel URL here]

## ✨ Features Implemented

### Core Requirements ✅
- **Real-time Pagination**: Page breaks update dynamically as you type
- **US Letter Format**: 8.5" × 11" with 1-inch margins on all sides
- **Print Accuracy**: WYSIWYG - what you see matches print output
- **Rich Text Formatting**: Bold, italic, underline, headings (H1, H2), bullet lists
- **Text Alignment**: Left, center, right alignment support

### Edge Cases Handled ✅
- **Long paragraphs** spanning multiple pages
- **Content reflow** when editing mid-document
- **Variable line heights** from different formatting (headings vs paragraphs)
- **Dynamic insertion/deletion** - page breaks recalculate instantly

### Optional Enhancements ✅
- **Page numbers** displayed on each page
- **Export to HTML** with proper print styling
- **Print functionality** with browser print dialog
- **Visual guides** (toggle-able red dashed lines showing page breaks)
- **Document statistics** panel showing page count and breaks

## 🛠 Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Editor:** Tiptap (ProseMirror-based)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Language:** TypeScript

## 📦 Installation
```bash
# Clone the repository
git clone [your-repo-url]
cd tiptap-pagination-editor

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗 Project Structure
```
tiptap-pagination-editor/
├── app/
│   ├── components/
│   │   └── PaginatedEditor.tsx    # Main editor component
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Home page
├── package.json
└── README.md
```

## 🎯 Technical Approach

### Pagination Algorithm

The core pagination logic uses **DOM-based height measurement**:
```typescript
const calculatePageBreaks = () => {
  // 1. Get all top-level editor nodes (paragraphs, headings, etc.)
  const nodes = Array.from(editorElement.children);
  
  // 2. Track cumulative height
  let currentPageHeight = 0;
  let pageNumber = 1;
  
  // 3. For each node, measure actual rendered height
  nodes.forEach((node) => {
    const totalHeight = node.offsetHeight + margins;
    
    // 4. If adding this node exceeds page height, insert page break
    if (currentPageHeight + totalHeight > CONTENT_HEIGHT) {
      pageBreaks.push({ pageNumber, top: node.offsetTop });
      pageNumber++;
      currentPageHeight = totalHeight;
    } else {
      currentPageHeight += totalHeight;
    }
  });
};
```

### Why This Approach?

1. **Accuracy**: Measures actual rendered heights, not estimated values
2. **Flexibility**: Handles variable line heights automatically
3. **Performance**: Uses `requestAnimationFrame` for smooth updates
4. **Simplicity**: No complex layout calculations required

### Key Technical Decisions

| Decision | Reasoning |
|----------|-----------|
| DOM measurement over CSS calculations | More accurate for mixed content types |
| requestAnimationFrame for updates | Prevents UI jank during typing |
| US Letter at 96 DPI | Standard screen resolution mapping |
| 1-inch margins (96px) | Exact match to print output |
| Times New Roman font | Legal document standard |

## ⚖️ Trade-offs & Limitations

### Current Limitations

1. **Single Column Only**:
