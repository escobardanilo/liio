const latexReplacements: Array<[RegExp, string]> = [
  [/\\times\b/g, "×"], [/\\div\b/g, "÷"], [/\\cdot\b/g, "×"], [/\\pm\b/g, "±"],
  [/\\neq\b/g, "≠"], [/\\leq\b/g, "≤"], [/\\geq\b/g, "≥"],
];

export function sanitizeChildFacingText(value: string) {
  let text = value
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/\*\*([\s\S]*?)\*\*/g, "$1")
    .replace(/__([\s\S]*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/\\\[|\\\]|\\\(|\\\)/g, "")
    .replace(/\$\$?/g, "")
    .replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, "$1 ÷ $2")
    .replace(/\\sqrt\s*\{([^{}]+)\}/g, "√$1");

  for (const [pattern, replacement] of latexReplacements) text = text.replace(pattern, replacement);

  return text
    .replace(/\\[a-zA-Z]+\b/g, "")
    .replace(/[{}]/g, "")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
