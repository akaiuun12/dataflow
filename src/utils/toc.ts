export interface TocItem {
  id: string;
  text: string;
  level: number;
}

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const extractToc = (markdown: string): TocItem[] => {
  const lines = markdown.split('\n');
  const toc: TocItem[] = [];
  
  // Remove frontmatter if present
  let startIndex = 0;
  if (lines[0]?.trim() === '---') {
    for (let i = 1; i < lines.length; i++) {
      if (lines[i]?.trim() === '---') {
        startIndex = i + 1;
        break;
      }
    }
  }
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    
    // Match headings: #, ##, ###
    const h1Match = line.match(/^#\s+(.+)$/);
    const h2Match = line.match(/^##\s+(.+)$/);
    const h3Match = line.match(/^###\s+(.+)$/);
    
    if (h1Match) {
      const text = h1Match[1].trim();
      toc.push({
        id: slugify(text),
        text: text.replace(/[#*`]/g, '').trim(), // Remove markdown formatting
        level: 1,
      });
    } else if (h2Match) {
      const text = h2Match[1].trim();
      toc.push({
        id: slugify(text),
        text: text.replace(/[#*`]/g, '').trim(),
        level: 2,
      });
    } else if (h3Match) {
      const text = h3Match[1].trim();
      toc.push({
        id: slugify(text),
        text: text.replace(/[#*`]/g, '').trim(),
        level: 3,
      });
    }
  }
  
  return toc;
};

