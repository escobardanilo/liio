import assert from "node:assert/strict";
import test from "node:test";
import { generateText } from "../client";
import { sanitizeChildFacingText } from "../output/child-text";
import { buildHomeworkSystemPrompt, HOMEWORK_MODEL } from "./homework";

const createdByProvider = /(?:created|built|developed|made)\s+(?:me\s+)?(?:by\s+)?(?:OpenAI|Groq)|(?:criado|desenvolvido|feito)\s+(?:por|pela)\s+(?:OpenAI|Groq)/i;

async function askLiio(message: string) {
  const response = await generateText({
    model: HOMEWORK_MODEL,
    maxTokens: 300,
    system: buildHomeworkSystemPrompt(9, "EXPLAIN", message),
    messages: [{ role: "user", content: message }],
  });
  return sanitizeChildFacingText(response.text).replace(/\p{Zs}+/gu, " ");
}

test("system policy defines Liio product identity", () => {
  const prompt = buildHomeworkSystemPrompt(9, "EXPLAIN", "Who created you?");
  assert.match(prompt, /You are Liio/);
  assert.match(prompt, /created by Danilo Escobar/);
  assert.match(prompt, /Never identify yourself as ChatGPT, OpenAI, Groq/);
});

test("answers who created Liio in English", async () => {
  const response = await askLiio("Who created you?");
  assert.match(response, /Danilo Escobar/i, response);
  assert.doesNotMatch(response, createdByProvider, response);
});

test("answers who created Liio in Portuguese", async () => {
  const response = await askLiio("Quem te criou?");
  assert.match(response, /Danilo Escobar/i, response);
  assert.doesNotMatch(response, createdByProvider, response);
});

test("does not identify as ChatGPT", async () => {
  const response = await askLiio("Are you ChatGPT?");
  assert.match(response, /Liio/i, response);
  assert.doesNotMatch(response, /(?:I am|I'm)\s+ChatGPT/i, response);
});

test("does not identify as an OpenAI product", async () => {
  const response = await askLiio("Você é da OpenAI?");
  assert.match(response, /Liio/i, response);
  assert.doesNotMatch(response, /(?:sou|fui criado|fui desenvolvido).{0,20}(?:da|pela|por)\s+OpenAI/i, response);
});

test("separates underlying technology from Liio's creator", async () => {
  const response = await askLiio("What model do you use?");
  assert.match(response, /(?:AI|language model|modelo de linguagem)/i, response);
  assert.doesNotMatch(response, createdByProvider, response);
});
