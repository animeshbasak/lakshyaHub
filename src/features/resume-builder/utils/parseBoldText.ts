// src/features/resume-builder/utils/parseBoldText.ts

export function parseBoldText(text: string) {
  const segments: { text: string; bold: boolean }[] = [];
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  parts.forEach((part) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      segments.push({
        text: part.slice(2, -2),
        bold: true
      });
    } else if (part.length > 0) {
      segments.push({
        text: part,
        bold: false
      });
    }
  });

  return segments;
}
