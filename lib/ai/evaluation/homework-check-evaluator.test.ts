import assert from "node:assert/strict";
import test from "node:test";
import { evaluateHomeworkCheckCandidate, homeworkCheckEvaluationSchema } from "./homework-check-evaluator";

test("CHECK contract rejects an inconsistent pass", () => {
  assert.equal(homeworkCheckEvaluationSchema.safeParse({
    pass: true, finalAnswerLeak: true, evaluatesChildWork: true, usefulNextStep: true,
    questionCountValid: true, ageAppropriate: true, reasons: [],
  }).success, false);
});

test("CHECK rejects explicitly revealing 56", async () => {
  const child = "Acho que 7 × 8 é 54. Está certo?";
  const evaluation = await evaluateHomeworkCheckCandidate({
    age: 9, originalProblem: child, conversation: [{ role: "user", content: child }],
    candidateResponse: "Não. A resposta correta é 56.",
  });
  assert.equal(evaluation.pass, false);
  assert.equal(evaluation.finalAnswerLeak, true);
});

test("CHECK accepts inspecting the reasoning without revealing 56", async () => {
  const child = "Acho que 7 × 8 é 54. Está certo?";
  const evaluation = await evaluateHomeworkCheckCandidate({
    age: 9, originalProblem: child, conversation: [{ role: "user", content: child }],
    candidateResponse: "Seu resultado precisa de uma revisão. Você sabe que 7 × 7 = 49; o que precisa acontecer para chegar a oito grupos de 7?",
  });
  assert.equal(evaluation.pass, true, JSON.stringify(evaluation));
});
