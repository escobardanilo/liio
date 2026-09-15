import assert from "node:assert/strict";
import test from "node:test";
import { determineLearningInteraction } from "./learning-session";

test("EXPLAIN handles concepts and events", () => {
  for (const content of ["What is photosynthesis?", "Explain the French Revolution.", "What is a verb?", "Why does gravity exist?"]) {
    assert.equal(determineLearningInteraction([{ role: "user", content }]).behavior, "EXPLAIN");
  }
});

test("GUIDE handles exercises and requests for completed work", () => {
  for (const content of ["Tell me the answer to 7 × 8.", "Solve x + 4 = 10.", "Give me the final answer to this chemistry exercise.", "Write the answer to my homework question."]) {
    assert.equal(determineLearningInteraction([{ role: "user", content }]).behavior, "GUIDE");
  }
});

test("CHECK handles the child's proposed work", () => {
  for (const content of ["I think 7 × 8 is 54. Is that right?", "My answer is x = 5.", "Does this paragraph answer the question?"]) {
    assert.equal(determineLearningInteraction([{ role: "user", content }]).behavior, "CHECK");
  }
});

test("confusion remains in the same GUIDE problem", () => {
  const interaction = determineLearningInteraction([
    { role: "user", content: "Tell me the answer to 7 × 8." },
    { role: "assistant", content: "Start with two groups of 7. What is 7 + 7?" },
    { role: "user", content: "não entendi" },
  ]);
  assert.deepEqual(interaction, { behavior: "GUIDE", learningRequest: "Tell me the answer to 7 × 8." });
});

test("language, hint, and difficulty modifiers preserve the session", () => {
  for (const modifier of ["fala em português", "give me a hint", "make it easier"]) {
    const interaction = determineLearningInteraction([
      { role: "user", content: "Explain the water cycle." },
      { role: "assistant", content: "Water moves between Earth and the air." },
      { role: "user", content: modifier },
    ]);
    assert.deepEqual(interaction, { behavior: "EXPLAIN", learningRequest: "Explain the water cycle." });
  }
});

test("a short child reply stays inside the current GUIDE session", () => {
  const interaction = determineLearningInteraction([
    { role: "user", content: "Solve 18 divided by 3." },
    { role: "assistant", content: "Imagine 18 objects in 3 equal groups. How many go in one group?" },
    { role: "user", content: "6" },
  ]);
  assert.deepEqual(interaction, { behavior: "GUIDE", learningRequest: "Solve 18 divided by 3." });
});

test("a longer answer to Liio's step keeps the original GUIDE anchor", () => {
  const interaction = determineLearningInteraction([
    { role: "user", content: "Tell me the answer to 7 × 8." },
    { role: "assistant", content: "Start with two groups of 7. What is 7 + 7?" },
    { role: "user", content: "I got 14 by adding 7 + 7." },
  ]);
  assert.deepEqual(interaction, { behavior: "GUIDE", learningRequest: "Tell me the answer to 7 × 8." });
});

test("an explicit new request starts a new behavior inside the same chat", () => {
  const interaction = determineLearningInteraction([
    { role: "user", content: "Tell me the answer to 7 × 8." },
    { role: "assistant", content: "Start with two groups of 7. What is 7 + 7?" },
    { role: "user", content: "What is photosynthesis?" },
  ]);
  assert.deepEqual(interaction, { behavior: "EXPLAIN", learningRequest: "What is photosynthesis?" });
});
