export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const extractToc = (markdown: string): TocItem[] => {
  if (!markdown) return [];
  
  let lines = markdown.split('\n');
  const toc: TocItem[] = [];
  const idCounts: Record<string, number> = {};
  
  // Remove frontmatter if present (consistent with MarkdownRenderer.tsx)
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
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    
    const trimmedLine = line.trim();
    
    // Check if we're entering or exiting a code block
    if (trimmedLine.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    
    if (inCodeBlock) continue;
    
    const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const text = headerMatch[2].trim();
      const cleanText = text.replace(/[#*`]/g, '').trim();
      
      if (cleanText) {
        let id = slugify(cleanText);
        if (idCounts[id] !== undefined) {
          idCounts[id]++;
          id = `${id}-${idCounts[id]}`;
        } else {
          idCounts[id] = 0;
        }

        toc.push({
          id,
          text: cleanText,
          level,
        });
      }
    }
  }
  
  return toc;
};

