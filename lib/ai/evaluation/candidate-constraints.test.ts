import assert from "node:assert/strict";
import test from "node:test";
import { assessChildCandidate, countGuidingQuestions } from "./candidate-constraints";
import { sanitizeChildFacingText } from "../output/child-text";

test("counts three questions deterministically", () => {
  const candidate = "What is 7 × 5? What is 7 × 3? What should you add next?";
  assert.equal(countGuidingQuestions(candidate), 3);
  assert.equal(assessChildCandidate(candidate, 9).questionCountValid, false);
});

test("rejects a dense multi-step lecture for age 9", () => {
  const candidate = "1. First decompose 8 into 5 and 3 and calculate both products carefully.\n2. Then add the two products and compare the total with the original expression.\n3. Finally verify the result using repeated addition and write a complete explanation of every operation before checking all the arithmetic again.";
  assert.equal(assessChildCandidate(candidate, 9).ageAppropriateLength, false);
});

test("sanitizes Markdown headings, bold, and LaTeX commands", () => {
  const result = sanitizeChildFacingText("### Try this\n**7 \\times 4**\n\\[7 \\times 4\\]\n\\frac{8}{2}");
  assert.equal(result, "Try this\n7 × 4\n7 × 4\n8 ÷ 2");
  assert.doesNotMatch(result, /\*\*|###|\\times|\\frac|\\\[|\\\]/);
});
