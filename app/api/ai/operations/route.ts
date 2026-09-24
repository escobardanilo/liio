import { z } from "zod";
import { AiConfigurationError, generateText } from "../../../../lib/ai/client";
import { buildDeterministicOperationalFallback, evaluateOperationalCandidate } from "../../../../lib/ai/evaluation/operational-evaluator";
import { sanitizeOperationalText } from "../../../../lib/ai/output/operational-text";
import { determineOperationalInteraction } from "../../../../lib/ai/policies/operational-session";
import { buildOperationsCorrectionPrompt, buildOperationsSystemPrompt, OPERATIONS_MODEL } from "../../../../lib/ai/policies/operations";
import { locales } from "../../../../lib/i18n/translations";

export const runtime = "nodejs";

const messageSchema = z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(4000) });
const requestSchema = z.object({ locale: z.enum(locales).default("en"), messages: z.array(messageSchema).min(1).max(30) }).refine((value) => value.messages.at(-1)?.role === "user", { message: "The final message must come from the operator.", path: ["messages"] });

function sanitizeDraft(draft: { id: string; text: string }) {
  return { ...draft, text: sanitizeOperationalText(draft.text) };
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: { code: "INVALID_JSON", message: "The request body must be valid JSON." } }, { status: 400 }); }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: { code: "INVALID_REQUEST", message: "Check the operational conversation and try again.", issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })) } }, { status: 400 });

  const { locale, messages } = parsed.data;
  const interaction = determineOperationalInteraction(messages);
  try {
    const initial = sanitizeDraft(await generateText({ model: OPERATIONS_MODEL, maxTokens: 900, system: buildOperationsSystemPrompt(interaction.behavior, interaction.operationalRequest, locale), messages }));
    let finalResponse = initial;
    try {
      const firstEvaluation = await evaluateOperationalCandidate({ ...interaction, conversation: messages, candidateResponse: initial.text });
      if (!firstEvaluation.pass) {
        const regenerated = sanitizeDraft(await generateText({ model: OPERATIONS_MODEL, maxTokens: 900, system: buildOperationsCorrectionPrompt(interaction.behavior, interaction.operationalRequest, firstEvaluation.reasons, locale), messages }));
        const secondEvaluation = await evaluateOperationalCandidate({ ...interaction, conversation: messages, candidateResponse: regenerated.text });
        finalResponse = secondEvaluation.pass ? regenerated : { id: crypto.randomUUID(), text: buildDeterministicOperationalFallback(interaction.behavior, locale) };
      }
    } catch (evaluationError) {
      if (evaluationError instanceof AiConfigurationError) throw evaluationError;
      console.error("Operational safety evaluation failed", evaluationError instanceof Error ? evaluationError.message : "Unknown error");
      finalResponse = { id: crypto.randomUUID(), text: buildDeterministicOperationalFallback(interaction.behavior, locale) };
    }
    return Response.json({ message: { id: finalResponse.id, role: "assistant", content: finalResponse.text } });
  } catch (error) {
    if (error instanceof AiConfigurationError) return Response.json({ error: { code: "AI_NOT_CONFIGURED", message: "SON is not connected yet. Contact the system administrator." } }, { status: 503 });
    console.error("Operational generation failed", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: { code: "AI_UNAVAILABLE", message: "SON is temporarily unavailable. Try again shortly." } }, { status: 502 });
  }
}
