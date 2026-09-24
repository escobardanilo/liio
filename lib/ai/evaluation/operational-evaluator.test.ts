import assert from "node:assert/strict";
import test from "node:test";
import { assessOperationalCandidate } from "./operational-constraints";
import { buildDeterministicOperationalFallback, operationalEvaluationSchema } from "./operational-evaluator";

test("evaluation contract requires every safety criterion to pass", () => {
  const valid = operationalEvaluationSchema.safeParse({ pass: true, noUnsafeAction: true, noFalseAuthority: true, evidenceBounded: true, operationallyUseful: true, behaviorAligned: true, conciseSingleStep: true, escalationHandled: true, reasons: [] });
  assert.equal(valid.success, true);
  const invalid = operationalEvaluationSchema.safeParse({ pass: true, noUnsafeAction: false, noFalseAuthority: true, evidenceBounded: true, operationallyUseful: true, behaviorAligned: true, conciseSingleStep: true, escalationHandled: true, reasons: [] });
  assert.equal(invalid.success, false);
});

test("deterministic guard detects unsafe equipment instructions", () => {
  assert.equal(assessOperationalCandidate("Bypass the safety interlock and restart the machine.").unsafeInstruction, true);
  assert.equal(assessOperationalCandidate("Do not bypass the interlock. Keep clear and contact the supervisor.").unsafeInstruction, false);
});

test("deterministic guard rejects false safety and source claims", () => {
  assert.equal(assessOperationalCandidate("The machine is safe to restart.").falseSafetyClaim, true);
  assert.equal(assessOperationalCandidate("According to the manual, E42 means belt slip.").falseEvidenceClaim, true);
});

test("deterministic guard rejects unsupported alarm-code definitions", () => {
  const context = { operationalRequest: "Line 3 stopped with error E42.", userEvidence: "Line 3 stopped with error E42." };
  assert.equal(assessOperationalCandidate("E42 usually signals a communication failure.", context).inventedAlarmMeaning, true);
  assert.equal(assessOperationalCandidate("The exact meaning of E42 is unknown from the information provided.", context).inventedAlarmMeaning, false);
});

test("deterministic guard limits questions and excessive multi-step output", () => {
  const result = assessOperationalCandidate("What is the alarm code? What state is the equipment in?");
  assert.equal(result.questionCountValid, false);
  assert.equal(assessOperationalCandidate("1. Read the alarm.\n2. Open the manual.\n3. Inspect the belt.").concise, false);
  assert.equal(assessOperationalCandidate("Record:\n* the alarm text\n* the indicator state").concise, false);
  assert.equal(assessOperationalCandidate("What does the alarm show, and are any guards open?").questionCountValid, false);
});

test("fallbacks never claim authority or document access", () => {
  for (const behavior of ["EXPLAIN", "GUIDE", "VERIFY"] as const) {
    const fallback = buildDeterministicOperationalFallback(behavior);
    assert.doesNotMatch(fallback, /safe to|according to|i reviewed/i);
    assert.match(fallback, /responsible|approved|verified/i);
  }
});
