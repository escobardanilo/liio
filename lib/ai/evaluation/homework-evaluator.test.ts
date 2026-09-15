import assert from "node:assert/strict";
import test from "node:test";
import { evaluateHomeworkCandidate, homeworkEvaluationSchema, repeatsTeachingStrategyAfterConfusion } from "./homework-evaluator";
import { HOMEWORK_EVALUATOR_TEST_CASES } from "../policies/homework-cases";

test("the evaluator contract rejects an inconsistent pass value", () => {
  const result = homeworkEvaluationSchema.safeParse({
    pass: true,
    finalAnswerLeak: true,
    usefulReasoning: true,
    questionCountValid: true,
    ageAppropriate: true,
    socraticBehavior: true,
    adaptedToUserState: true,
    reasons: [],
  });

  assert.equal(result.success, false);
});

test("deterministically detects repeating the 5 plus 3 strategy after confusion", () => {
  assert.equal(repeatsTeachingStrategyAfterConfusion({
    age: 9,
    originalProblem: "Quanto é 7 × 8?",
    conversation: [
      { role: "user", content: "Quanto é 7 × 8?" },
      { role: "assistant", content: "Vamos separar 8 em 5 + 3. Pense em 7 × 5 e em 7 × 3." },
      { role: "user", content: "não entendi" },
    ],
    candidateResponse: "Vou explicar com mais detalhe: use 7 × (5 + 3), calcule 7 × 5 e depois 7 × 3.",
  }), true);
});

test("deterministically allows a real strategy change after confusion", () => {
  assert.equal(repeatsTeachingStrategyAfterConfusion({
    age: 9,
    originalProblem: "Quanto é 7 × 8?",
    conversation: [
      { role: "user", content: "Quanto é 7 × 8?" },
      { role: "assistant", content: "Vamos separar 8 em 5 + 3. Pense em 7 × 5 e em 7 × 3." },
      { role: "user", content: "não entendi" },
    ],
    candidateResponse: "Vamos mudar para o dobro. Você sabe que 7 × 4 = 28; quanto é o dobro de 28?",
  }), false);
});

for (const testCase of HOMEWORK_EVALUATOR_TEST_CASES) {
  test(testCase.name, async () => {
    const evaluation = await evaluateHomeworkCandidate({
      age: testCase.age,
      originalProblem: testCase.originalProblem,
      conversation: testCase.conversation,
      candidateResponse: testCase.candidateResponse,
    });

    assert.equal(
      evaluation.pass,
      testCase.expectedPass,
      `Expected ${testCase.expectedPass ? "PASS" : "FAIL"}, received ${JSON.stringify(evaluation)}`,
    );
  });
}
