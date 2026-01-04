
import React, { useState, memo } from 'react';
import Prism from 'prismjs';
// Prism language components - must be imported after Prism
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import katex from 'katex';

interface MarkdownRendererProps {
  content: string;
}

const CopyButton: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className={`text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all duration-200 ${
        copied 
        ? 'text-green-400' 
        : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
};

const MarkdownRendererComponent: React.FC<MarkdownRendererProps> = ({ content }) => {
  
  const renderLineContent = (text: string): React.ReactNode[] => {
    // 1. Split by images: ![alt](url)
    const imgParts = text.split(/(!\[[^\]]*\]\([^)]+\))/g);
    
    return imgParts.flatMap((part, i) => {
      if (part.startsWith('![') && part.includes('](')) {
        const alt = part.match(/\[([^\]]*)\]/)?.[1] || '';
        const url = part.match(/\(([^)]+)\)/)?.[1] || '';
        return <img key={`img-${i}`} src={url} alt={alt} className="rounded-2xl border border-black/5 dark:border-white/5 my-4 mx-auto block max-w-full" />;
      }

      // 2. Split by links: [text](url)
      const linkParts = part.split(/(\[[^\]]+\]\([^)]+\))/g);
      return linkParts.flatMap((lp, j) => {
        if (lp.startsWith('[') && lp.includes('](') && !lp.startsWith('![')) {
          const linkText = lp.match(/\[([^\]]+)\]/)?.[1] || '';
          const url = lp.match(/\(([^)]+)\)/)?.[1] || '';
          return <a key={`link-${i}-${j}`} href={url} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline font-bold transition-all">{linkText}</a>;
        }

        // 3. Split by inline math: $...$
        const mathParts = lp.split(/(\$[^$]+\$)/g);
        return mathParts.flatMap((mp, k) => {
          if (mp.startsWith('$') && mp.endsWith('$') && mp.length > 2) {
            const math = mp.slice(1, -1);
            try {
              const html = katex.renderToString(math, { throwOnError: false, displayMode: false });
              return <span key={`math-${i}-${j}-${k}`} dangerouslySetInnerHTML={{ __html: html }} className="inline-block mx-1" />;
            } catch (e) {
              return <span key={`math-err-${i}-${j}-${k}`}>{mp}</span>;
            }
          }

          // 4. Split by inline code: `code`
          const codeParts = mp.split(/(`[^`]+`)/g);
          return codeParts.flatMap((cp, l) => {
            if (cp.startsWith('`') && cp.endsWith('`') && cp.length > 2) {
              return <code key={`inline-code-${i}-${j}-${k}-${l}`} className="inline-code">{cp.slice(1, -1)}</code>;
            }

            // 5. Split by Bold: **bold** (allowing nested italics and extra stars at end)
            const boldParts = cp.split(/(\*\*(?:(?!\*\*).)+?\*\*+)/g);
            return boldParts.flatMap((bp, m) => {
              if (bp.startsWith('**') && bp.endsWith('**') && bp.length > 4) {
                return <strong key={`bold-${i}-${j}-${k}-${l}-${m}`} className="text-red-600 font-bold">{renderLineContent(bp.slice(2, -2))}</strong>;
              }

              // 6. Split by Italic: *italic*
              const italicParts = bp.split(/(\*[^*]+\*)/g);
              return italicParts.map((ip, n) => {
                if (ip.startsWith('*') && ip.endsWith('*') && ip.length > 2) {
                  return <em key={`italic-${i}-${j}-${k}-${l}-${m}-${n}`} className="italic opacity-90">{renderLineContent(ip.slice(1, -1))}</em>;
                }
                return ip;
              });
            });
          });
        });
      });
    });
  };

  const renderTable = (rows: string[], key: string) => {
    if (rows.length < 2) return null;
    
    const headerRow = rows[0].split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1).map(s => s.trim());
    const dataRows = rows.slice(2).map(row => 
      row.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1).map(s => s.trim())
    );

    return (
      <div key={key} className="my-8 overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-900/5 dark:bg-slate-900/10">
        <table className="w-full text-left border-collapse text-xs sm:text-sm md:text-base">
          <thead className="bg-red-500/5 text-red-500 font-black uppercase tracking-widest text-[10px] sm:text-[11px] md:text-xs">
            <tr>
              {headerRow.map((h, i) => (
                <th key={i} className="px-6 py-4 border-b border-slate-200 dark:border-white/5">{renderLineContent(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody className="opacity-90">
            {dataRows.map((row, i) => (
              <tr key={i} className="even:bg-white/5 transition-colors hover:bg-red-500/5">
                {row.map((cell, j) => (
                  <td key={j} className="px-6 py-4 border-b border-slate-200 dark:border-white/5">{renderLineContent(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const parseMarkdown = (text: string) => {
    let lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    if (lines.length > 0 && lines[0].trim() === '---') {
      let endIdx = -1;
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '---') {
          endIdx = i;
          break;
        }
      }
      if (endIdx !== -1) {
        lines = lines.slice(endIdx + 1);
      }
    }
    
    let inCodeBlock = false;
    let codeContent: string[] = [];
    let codeLang = '';

    let inMathBlock = false;
    let mathContent: string[] = [];

    let inTable = false;
    let tableLines: string[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      const isTableRow = trimmedLine.startsWith('|') && trimmedLine.endsWith('|');
      
      if (isTableRow && !inCodeBlock && !inMathBlock) {
        inTable = true;
        tableLines.push(trimmedLine);
        return;
      } else if (inTable) {
        elements.push(renderTable(tableLines, `table-${index}`));
        inTable = false;
        tableLines = [];
        if (trimmedLine === '') return;
      }

      if (trimmedLine.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLang = trimmedLine.slice(3).toLowerCase() || 'javascript';
        } else {
          inCodeBlock = false;
          const code = codeContent.join('\n');
          const grammar = Prism.languages[codeLang] || Prism.languages.javascript;
          const highlighted = Prism.highlight(code, grammar, codeLang);
          
          elements.push(
            <div key={`code-block-${index}`} className="my-8 rounded-xl overflow-hidden bg-[#0d1117] border border-white/10 shadow-xl theme-transition group p-4">
              <div className="flex items-center justify-between px-5 py-2.5 bg-white/[0.03] border-b border-white/5">
                <span className="text-[9px] sm:text-[10px] md:text-xs font-bold font-mono text-slate-500 uppercase tracking-widest">{codeLang}</span>
                <CopyButton code={code} />
              </div>
              <pre className={`pt-6 pr-6 pb-6 sm:pt-8 sm:pr-8 sm:pb-8 md:pt-10 md:pr-10 md:pb-10 lg:pt-12 lg:pr-12 lg:pb-12 pl-[3px] mt-0 mb-0 mr-0 ml-4 overflow-x-auto font-mono text-xs sm:text-sm md:text-[13px] lg:text-base leading-relaxed language-${codeLang}`}>
                <code dangerouslySetInnerHTML={{ __html: highlighted }} />
              </pre>
            </div>
          );
          codeContent = [];
        }
        return;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        return;
      }

      if (trimmedLine.startsWith('$$')) {
        if (trimmedLine.endsWith('$$') && trimmedLine.length > 4) {
          const math = trimmedLine.slice(2, -2);
          const html = katex.renderToString(math, { throwOnError: false, displayMode: true });
          elements.push(<div key={`math-block-${index}`} className="my-4 py-3 overflow-x-auto text-current bg-slate-900/5 dark:bg-slate-900/10 rounded-3xl" dangerouslySetInnerHTML={{ __html: html }} />);
          return;
        }

        if (!inMathBlock) {
          inMathBlock = true;
        } else {
          inMathBlock = false;
          const math = mathContent.join('\n');
          const html = katex.renderToString(math, { throwOnError: false, displayMode: true });
          elements.push(<div key={`math-block-multi-${index}`} className="my-4 py-3 overflow-x-auto text-current bg-slate-900/5 dark:bg-slate-900/10 rounded-3xl" dangerouslySetInnerHTML={{ __html: html }} />);
          mathContent = [];
        }
        return;
      }

      if (inMathBlock) {
        mathContent.push(line);
        return;
      }

      const key = `line-${index}`;
      
      // Match list items with optional indentation
      const unorderedListMatch = line.match(/^(\s*)([-*])\s+(.*)/);
      const orderedListMatch = line.match(/^(\s*)(\d+\.)\s+(.*)/);

      if (line.startsWith('# ')) {
        const titleText = line.slice(2);
        const isFirstElement = elements.length === 0;
        elements.push(<h1 id={slugify(titleText)} key={key} className={`text-2xl sm:text-3xl md:text-4xl font-black ${isFirstElement ? 'mt-4' : 'mt-8'} mb-2 tracking-tighter leading-tight text-current scroll-mt-24`}>{renderLineContent(titleText)}</h1>);
      } else if (line.startsWith('## ')) {
        const titleText = line.slice(3);
        elements.push(<h2 id={slugify(titleText)} key={key} className="text-lg sm:text-xl md:text-2xl font-bold mt-6 mb-2 border-b border-red-500/10 pb-1 tracking-tight text-current scroll-mt-24">{renderLineContent(titleText)}</h2>);
      } else if (line.startsWith('### ')) {
        const titleText = line.slice(4);
        elements.push(<h3 id={slugify(titleText)} key={key} className="text-base sm:text-lg md:text-xl font-semibold mt-4 mb-1 text-current scroll-mt-24">{renderLineContent(titleText)}</h3>);
      } else if (unorderedListMatch) {
        const indent = unorderedListMatch[1].length;
        const content = unorderedListMatch[3];
        const depth = Math.floor(indent / 2); // Assume 2 or 4 spaces per level
        elements.push(
          <li 
            key={key} 
            className={`mb-1 list-disc leading-relaxed opacity-90 text-sm sm:text-[15px] md:text-base pl-3`}
            style={{ marginLeft: `${(depth + 1) * 1.5}rem` }}
          >
            {renderLineContent(content)}
          </li>
        );
      } else if (orderedListMatch) {
        const indent = orderedListMatch[1].length;
        const content = orderedListMatch[3];
        const depth = Math.floor(indent / 2);
        elements.push(
          <li 
            key={key} 
            className={`mb-1 list-decimal leading-relaxed opacity-90 text-sm sm:text-[15px] md:text-base pl-3`}
            style={{ marginLeft: `${(depth + 1) * 1.5}rem` }}
          >
            {renderLineContent(content)}
          </li>
        );
      } else if (line.startsWith('> ')) {
        elements.push(<blockquote key={key} className="border-l-4 border-red-600 bg-red-600/5 dark:bg-red-600/10 px-4 sm:px-6 py-3 my-4 italic rounded-r-3xl opacity-80 text-sm sm:text-base md:text-lg">{renderLineContent(line.slice(2))}</blockquote>);
      } else if (trimmedLine === '') {
        elements.push(<div key={key} className="h-1" />);
      } else {
        elements.push(<p key={key} className="mb-1 leading-relaxed text-base sm:text-lg md:text-xl font-medium opacity-90">{renderLineContent(line)}</p>);
      }
    });

    if (inTable) {
        elements.push(renderTable(tableLines, `table-final`));
    }

    return elements;
  };

  return <div className="max-w-none prose dark:prose-invert markdown-content">{parseMarkdown(content)}</div>;
};

// Optimization: Memoize the renderer to prevent stuttering on scroll or other parent state updates
const MarkdownRenderer = memo(MarkdownRendererComponent);

export default MarkdownRenderer;
