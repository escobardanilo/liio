import type { SupportedChildAge } from "../policies/age";

const questionLead = /(?:^|:\s*)(?:what|why|how|which|where|when|who|can|could|would|do|does|did|is|are|quanto|quantos|quantas|qual|quais|como|por que|porque|onde|quando|quem|pode|consegue|sera que)\b/i;

export function countGuidingQuestions(text: string) {
  const segments = text
    .split(/(?<=[.!?])(?:\s+|$)|\n+/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  return segments.reduce((total, segment) => {
    const questionMarks = segment.match(/\?/g)?.length ?? 0;
    if (questionMarks > 0) return total + questionMarks;
    return total + (questionLead.test(segment) ? 1 : 0);
  }, 0);
}

function countSentences(text: string) {
  return text.split(/[.!?]+|\n+/).map((sentence) => sentence.trim()).filter(Boolean).length;
}

export function assessChildCandidate(text: string, age: SupportedChildAge) {
  const words = text.match(/[\p{L}\p{N}]+/gu) ?? [];
  const paragraphs = text.split(/\n{2,}/).map((paragraph) => paragraph.match(/[\p{L}\p{N}]+/gu)?.length ?? 0);
  const numberedSteps = text.match(/(?:^|\n)\s*\d+[.)]\s+/gm)?.length ?? 0;
  const maximumWords = age <= 8 ? 55 : age <= 12 ? 75 : 105;
  const maximumParagraphWords = age <= 12 ? 50 : 75;
  const questionCount = countGuidingQuestions(text);

  return {
    questionCount,
    questionCountValid: questionCount <= 1,
    ageAppropriateLength: words.length <= maximumWords
      && countSentences(text) <= 4
      && Math.max(0, ...paragraphs) <= maximumParagraphWords
      && numberedSteps < 2,
  };
}
