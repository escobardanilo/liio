export function sanitizeOperationalText(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/\*\*([\s\S]*?)\*\*/g, "$1")
    .replace(/__([\s\S]*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
