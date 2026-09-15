export const AGE_PRESETS = [6, 9, 12, 15] as const;

export const MOCK_CHILD_AGE = 9;

export type SupportedChildAge = number;

export function buildAgeGuidance(age: SupportedChildAge) {
  if (age <= 8) {
    return "Use very simple words and short, playful sentences. Explain one tiny idea at a time.";
  }

  if (age <= 12) {
    return "Be friendly and slightly more precise. Use familiar examples and keep each step easy to follow.";
  }

  return "Be respectful and direct. Use age-appropriate academic language without baby talk.";
}
