import assert from "node:assert/strict";
import test from "node:test";
import { locales, translate, translations } from "./translations";
import { buildOperationsSystemPrompt } from "../ai/policies/operations";

test("all supported locales contain every translation key", () => {
  const englishKeys = Object.keys(translations.en).sort();
  for (const locale of locales) {
    assert.deepEqual(Object.keys(translations[locale]).sort(), englishKeys);
    assert.ok(Object.values(translations[locale]).every((value) => value.trim().length > 0));
  }
});

test("translation variables are interpolated", () => {
  assert.equal(translate("pt", "knowledge.demoFiles", { count: 4 }), "4 ficheiros demo");
  assert.equal(translate("de", "knowledge.demoRecords", { count: 2 }), "2 Demo-Einträge");
});

test("operations prompt explicitly locks each selected UI language", () => {
  const expected = { pt: "Portuguese", en: "English", es: "Spanish", de: "German" } as const;
  for (const locale of locales) {
    const prompt = buildOperationsSystemPrompt("EXPLAIN", "Explain this asset.", locale);
    assert.match(prompt, new RegExp(`Reply only in ${expected[locale]}`, "i"));
    assert.match(prompt, /language explicitly selected in the application/i);
  }
});
