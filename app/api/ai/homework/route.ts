import { z } from "zod";
import { AiConfigurationError, generateText } from "../../../../lib/ai/client";
import {
  buildDeterministicHomeworkFallback,
  evaluateHomeworkCandidate,
} from "../../../../lib/ai/evaluation/homework-evaluator";
import {
  buildDeterministicCheckFallback,
  evaluateHomeworkCheckCandidate,
} from "../../../../lib/ai/evaluation/homework-check-evaluator";
import { MOCK_CHILD_AGE } from "../../../../lib/ai/policies/age";
import {
  buildHomeworkCheckCorrectionPrompt,
  buildHomeworkCorrectionPrompt,
  buildHomeworkSystemPrompt,
  HOMEWORK_MODEL,
} from "../../../../lib/ai/policies/homework";
import { determineLearningInteraction } from "../../../../lib/ai/policies/learning-session";
import { sanitizeChildFacingText } from "../../../../lib/ai/output/child-text";

export const runtime = "nodejs";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4_000),
});

const homeworkRequestSchema = z.object({
  age: z.number().int().min(6).max(15).default(MOCK_CHILD_AGE),
  language: z.enum(["pt", "en", "es", "de"]).default("en"),
  messages: z.array(messageSchema).min(1).max(40),
}).refine((value) => value.messages.at(-1)?.role === "user", {
  message: "The final conversation message must come from the child.",
  path: ["messages"],
});

function sanitizeDraft(draft: { id: string; text: string }) {
  return { ...draft, text: sanitizeChildFacingText(draft.text) };
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: { code: "INVALID_JSON", message: "The request body must be valid JSON." } },
      { status: 400 },
    );
  }

  const parsed = homeworkRequestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        error: {
          code: "INVALID_REQUEST",
          message: "Please check the conversation and try again.",
          issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
        },
      },
      { status: 400 },
    );
  }

  const { age, language, messages } = parsed.data;
  const languageInstruction = {
    pt: "Reply only in European Portuguese unless the child explicitly asks for another language.",
    en: "Reply only in English unless the child explicitly asks for another language.",
    es: "Reply only in Spanish unless the child explicitly asks for another language.",
    de: "Reply only in German unless the child explicitly asks for another language.",
  }[language];
  const interaction = determineLearningInteraction(messages);

  try {
    const initialDraft = sanitizeDraft(await generateText({
      model: HOMEWORK_MODEL,
      maxTokens: 1_000,
      system: `${buildHomeworkSystemPrompt(age, interaction.behavior, interaction.learningRequest)}\n\nLanguage for this session:\n${languageInstruction}`,
      messages,
    }));

    let finalResponse: { id: string; text: string } = initialDraft;

    if (interaction.behavior === "GUIDE") {
      try {
        const initialEvaluation = await evaluateHomeworkCandidate({
          age,
          originalProblem: interaction.learningRequest,
          conversation: messages,
          candidateResponse: initialDraft.text,
        });

        if (!initialEvaluation.pass) {
          const regeneratedDraft = sanitizeDraft(await generateText({
            model: HOMEWORK_MODEL,
            maxTokens: 1_000,
            system: `${buildHomeworkCorrectionPrompt(age, interaction.learningRequest, initialEvaluation.reasons)}\n\nLanguage for this session:\n${languageInstruction}`,
            messages,
          }));

          const regeneratedEvaluation = await evaluateHomeworkCandidate({
            age,
            originalProblem: interaction.learningRequest,
            conversation: messages,
            candidateResponse: regeneratedDraft.text,
          });

          finalResponse = regeneratedEvaluation.pass
            ? regeneratedDraft
            : {
                id: crypto.randomUUID(),
                text: buildDeterministicHomeworkFallback(age),
              };
        }
      } catch (evaluationError) {
        if (evaluationError instanceof AiConfigurationError) throw evaluationError;
        console.error("Homework safety evaluation failed", evaluationError instanceof Error ? evaluationError.message : "Unknown error");
        finalResponse = {
          id: crypto.randomUUID(),
          text: buildDeterministicHomeworkFallback(age),
        };
      }
    }

    if (interaction.behavior === "CHECK") {
      try {
        const initialEvaluation = await evaluateHomeworkCheckCandidate({
          age,
          originalProblem: interaction.learningRequest,
          conversation: messages,
          candidateResponse: initialDraft.text,
        });

        if (!initialEvaluation.pass) {
          const regeneratedDraft = sanitizeDraft(await generateText({
            model: HOMEWORK_MODEL,
            maxTokens: 1_000,
            system: `${buildHomeworkCheckCorrectionPrompt(age, interaction.learningRequest, initialEvaluation.reasons)}\n\nLanguage for this session:\n${languageInstruction}`,
            messages,
          }));

          const regeneratedEvaluation = await evaluateHomeworkCheckCandidate({
            age,
            originalProblem: interaction.learningRequest,
            conversation: messages,
            candidateResponse: regeneratedDraft.text,
          });

          finalResponse = regeneratedEvaluation.pass
            ? regeneratedDraft
            : { id: crypto.randomUUID(), text: buildDeterministicCheckFallback(age) };
        }
      } catch (evaluationError) {
        if (evaluationError instanceof AiConfigurationError) throw evaluationError;
        console.error("Homework CHECK evaluation failed", evaluationError instanceof Error ? evaluationError.message : "Unknown error");
        finalResponse = { id: crypto.randomUUID(), text: buildDeterministicCheckFallback(age) };
      }
    }

    return Response.json({
      message: { id: finalResponse.id, role: "assistant", content: finalResponse.text },
    });
  } catch (error) {
    if (error instanceof AiConfigurationError) {
      return Response.json(
        { error: { code: "AI_NOT_CONFIGURED", message: language === "pt" ? "liio ainda não está ligado. Tenta novamente mais tarde." : language === "es" ? "liio todavía no está conectado. Inténtalo de nuevo más tarde." : language === "de" ? "liio ist noch nicht verbunden. Versuch es später erneut." : "liio is not connected yet. Please try again later." } },
        { status: 503 },
      );
    }

    console.error("Homework generation failed", error instanceof Error ? error.message : "Unknown error");
    return Response.json(
      { error: { code: "AI_UNAVAILABLE", message: language === "pt" ? "liio precisa de um momento. Tenta novamente daqui a pouco." : language === "es" ? "liio necesita un momento. Inténtalo de nuevo en breve." : language === "de" ? "liio braucht einen Moment. Versuch es gleich noch einmal." : "liio needs a moment. Please try again shortly." } },
      { status: 502 },
    );
  }
}
