
import React, { useState } from 'react';
import Prism from 'prismjs';
// Prism language components
import 'https://esm.sh/prismjs@1.29.0/components/prism-python?no-check';
import 'https://esm.sh/prismjs@1.29.0/components/prism-typescript?no-check';
import 'https://esm.sh/prismjs@1.29.0/components/prism-javascript?no-check';
import 'https://esm.sh/prismjs@1.29.0/components/prism-sql?no-check';
import 'https://esm.sh/prismjs@1.29.0/components/prism-bash?no-check';
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
      className={`text-[10px] font-black uppercase tracking-widest transition-all duration-300 px-3 py-1 rounded-lg border ${
        copied 
        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
        : 'text-slate-500 hover:text-red-400 border-transparent hover:border-white/10'
      }`}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  
  const renderLineContent = (text: string): React.ReactNode[] => {
    // 1. Split by inline math: $...$
    const mathParts = text.split(/(\$[^$]+\$)/g);
    
    return mathParts.flatMap((part, i) => {
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        const math = part.slice(1, -1);
        try {
          const html = katex.renderToString(math, { throwOnError: false, displayMode: false });
          return <span key={`math-${i}`} dangerouslySetInnerHTML={{ __html: html }} className="inline-block mx-1" />;
        } catch (e) {
          return <span key={`math-err-${i}`}>{part}</span>;
        }
      }

      // 2. Split by inline code: `code`
      const codeParts = part.split(/(`[^`]+`)/g);
      return codeParts.flatMap((cp, j) => {
        if (cp.startsWith('`') && cp.endsWith('`') && cp.length > 2) {
          return <code key={`inline-code-${i}-${j}`} className="inline-code">{cp.slice(1, -1)}</code>;
        }

        // 3. Split by Bold: **bold**
        const boldParts = cp.split(/(\*\*[^*]+\*\*)/g);
        return boldParts.flatMap((bp, k) => {
          if (bp.startsWith('**') && bp.endsWith('**') && bp.length > 4) {
            return <strong key={`bold-${i}-${j}-${k}`} className="text-red-500 font-bold">{bp.slice(2, -2)}</strong>;
          }

          // 4. Split by Italic: *italic*
          const italicParts = bp.split(/(\*[^*]+\*)/g);
          return italicParts.map((ip, l) => {
            if (ip.startsWith('*') && ip.endsWith('*') && ip.length > 2) {
              return <em key={`italic-${i}-${j}-${k}-${l}`} className="italic opacity-90">{ip.slice(1, -1)}</em>;
            }
            return ip;
          });
        });
      });
    });
  };

  const renderTable = (rows: string[], key: string) => {
    if (rows.length < 2) return null;
    
    // Extract headers
    const headerRow = rows[0].split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1).map(s => s.trim());
    // Filter out the separator row (containing ---)
    const dataRows = rows.slice(2).map(row => 
      row.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1).map(s => s.trim())
    );

    return (
      <div key={key} className="my-8 overflow-x-auto rounded-2xl border border-white/5 bg-slate-900/10">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-red-500/5 text-red-500 font-black uppercase tracking-widest text-[11px]">
            <tr>
              {headerRow.map((h, i) => (
                <th key={i} className="px-6 py-4 border-b border-white/5">{renderLineContent(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody className="opacity-90">
            {dataRows.map((row, i) => (
              <tr key={i} className="even:bg-white/5 transition-colors hover:bg-red-500/5">
                {row.map((cell, j) => (
                  <td key={j} className="px-6 py-4 border-b border-white/5">{renderLineContent(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const parseMarkdown = (text: string) => {
    let lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    // Hide Frontmatter if present at the start
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

      // Table Detection Logic
      const isTableRow = trimmedLine.startsWith('|') && trimmedLine.endsWith('|');
      
      if (isTableRow && !inCodeBlock && !inMathBlock) {
        inTable = true;
        tableLines.push(trimmedLine);
        return;
      } else if (inTable) {
        elements.push(renderTable(tableLines, `table-${index}`));
        inTable = false;
        tableLines = [];
        if (trimmedLine === '') return; // Skip the gap after table
      }

      // Handle Code Block start/end
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
            <div key={`code-block-${index}`} className="my-10 rounded-2xl overflow-hidden bg-[#0d1117] border border-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.15)] theme-transition">
              <div className="flex items-center justify-between px-6 py-3.5 bg-white/5 border-b border-white/5">
                <div className="flex items-center space-x-2">
                   <div className="flex space-x-2 mr-4">
                    <div className="w-3 h-3 rounded-full bg-red-500/40"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-800"></div>
                  </div>
                  <span className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-widest">{codeLang}</span>
                </div>
                <CopyButton code={code} />
              </div>
              <pre className={`p-12 overflow-x-auto font-mono text-[13px] leading-relaxed language-${codeLang}`}>
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

      // Handle Math Block: $$ ... $$
      if (trimmedLine.startsWith('$$')) {
        if (trimmedLine.endsWith('$$') && trimmedLine.length > 4) {
          const math = trimmedLine.slice(2, -2);
          const html = katex.renderToString(math, { throwOnError: false, displayMode: true });
          elements.push(<div key={`math-block-${index}`} className="my-4 py-3 overflow-x-auto text-current bg-slate-900/10 rounded-3xl" dangerouslySetInnerHTML={{ __html: html }} />);
          return;
        }

        if (!inMathBlock) {
          inMathBlock = true;
        } else {
          inMathBlock = false;
          const math = mathContent.join('\n');
          const html = katex.renderToString(math, { throwOnError: false, displayMode: true });
          elements.push(<div key={`math-block-multi-${index}`} className="my-4 py-3 overflow-x-auto text-current bg-slate-900/10 rounded-3xl" dangerouslySetInnerHTML={{ __html: html }} />);
          mathContent = [];
        }
        return;
      }

      if (inMathBlock) {
        mathContent.push(line);
        return;
      }

      const key = `line-${index}`;
      
      // Traditional Markdown Blocks
      if (line.startsWith('# ')) {
        elements.push(<h1 key={key} className="text-4xl font-black mt-20 mb-10 tracking-tighter leading-tight text-current">{renderLineContent(line.slice(2))}</h1>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={key} className="text-2xl font-bold mt-16 mb-8 border-b border-red-500/10 pb-4 tracking-tight text-current">{renderLineContent(line.slice(3))}</h2>);
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={key} className="text-xl font-semibold mt-12 mb-6 text-current">{renderLineContent(line.slice(4))}</h3>);
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(<li key={key} className="ml-8 mb-4 list-disc pl-3 leading-relaxed opacity-90">{renderLineContent(line.slice(2))}</li>);
      } else if (line.match(/^\d+\. /)) {
        elements.push(<li key={key} className="ml-8 mb-4 list-decimal pl-3 leading-relaxed opacity-90">{renderLineContent(line.replace(/^\d+\. /, ''))}</li>);
      } else if (line.startsWith('> ')) {
        elements.push(<blockquote key={key} className="border-l-4 border-red-600 bg-red-600/5 px-8 py-6 my-10 italic rounded-r-3xl opacity-80 text-lg">{renderLineContent(line.slice(2))}</blockquote>);
      } else if (trimmedLine === '') {
        elements.push(<div key={key} className="h-8" />);
      } else {
        elements.push(<p key={key} className="mb-6 leading-relaxed text-[17px] font-medium opacity-90">{renderLineContent(line)}</p>);
      }
    });

    // Final table flush if content ends with table
    if (inTable) {
        elements.push(renderTable(tableLines, `table-final`));
    }

    return elements;
  };

  return <div className="max-w-none prose prose-invert">{parseMarkdown(content)}</div>;
};

export default MarkdownRenderer;
