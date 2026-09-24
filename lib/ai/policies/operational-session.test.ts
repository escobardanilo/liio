import assert from "node:assert/strict";
import test from "node:test";
import { determineOperationalInteraction } from "./operational-session";

test("classifies technical explanations as EXPLAIN", () => {
  assert.equal(determineOperationalInteraction([{ role: "user", content: "What does a pressure interlock do?" }]).behavior, "EXPLAIN");
});

test("classifies faults and troubleshooting requests as GUIDE", () => {
  for (const content of ["Line 3 stopped with error E42.", "Help me troubleshoot the packaging line.", "What should I check next?"]) {
    assert.equal(determineOperationalInteraction([{ role: "user", content }]).behavior, "GUIDE");
  }
});

test("classifies supplied observations as VERIFY", () => {
  for (const content of ["I measured 6.2 bar at Pump P-204.", "Verify this observation for me.", "The reading was 42 degrees. Is this expected?"]) {
    assert.equal(determineOperationalInteraction([{ role: "user", content }]).behavior, "VERIFY");
  }
});

test("preserves the operational anchor for short modifiers", () => {
  const interaction = determineOperationalInteraction([
    { role: "user", content: "Line 3 stopped with error E42." },
    { role: "assistant", content: "Read the exact alarm text from the HMI without operating the line. What does it show?" },
    { role: "user", content: "I don't understand." },
  ]);
  assert.deepEqual(interaction, { behavior: "GUIDE", operationalRequest: "Line 3 stopped with error E42." });
});

test("classifies Spanish and German operational requests", () => {
  assert.equal(determineOperationalInteraction([{ role: "user", content: "La línea se detuvo con una alarma." }]).behavior, "GUIDE");
  assert.equal(determineOperationalInteraction([{ role: "user", content: "Ich habe 6,2 bar an der Pumpe gemessen." }]).behavior, "VERIFY");
});

test("preserves context for Spanish and German modifiers", () => {
  for (const modifier of ["No entiendo.", "Ich verstehe nicht."]) {
    const interaction = determineOperationalInteraction([
      { role: "user", content: "Der Motor ist gestoppt und zeigt einen Fehler." },
      { role: "assistant", content: "Lesen Sie den Fehlercode ab, ohne die Anlage zu bedienen." },
      { role: "user", content: modifier },
    ]);
    assert.deepEqual(interaction, { behavior: "GUIDE", operationalRequest: "Der Motor ist gestoppt und zeigt einen Fehler." });
  }
});
