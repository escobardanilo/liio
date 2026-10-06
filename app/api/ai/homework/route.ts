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
import { getLiioSupabaseServerClient } from "../../../../lib/data/supabase-server";
import { consumeRateLimit } from "../../../../lib/security/rate-limit";

export const runtime = "nodejs";

const PROMPT_VERSION = "homework-2026-10-06-v2";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4_000),
});

const homeworkRequestSchema = z
  .object({
    age: z.number().int().min(6).max(15).default(MOCK_CHILD_AGE),
    language: z.enum(["pt", "en", "es", "de"]).default("en"),
    messages: z.array(messageSchema).min(1).max(40),
    deviceToken: z.string().min(32).max(256).optional(),
    learningSessionId: z.string().uuid().optional(),
  })
  .refine((value) => value.messages.at(-1)?.role === "user", {
    message: "The final conversation message must come from the child.",
    path: ["messages"],
  });

function sanitizeDraft(draft: { id: string; text: string }) {
  return {
    ...draft,
    text: sanitizeChildFacingText(draft.text),
  };
}

function languageInstruction(language: "pt" | "en" | "es" | "de") {
  return {
    pt: "Reply only in European Portuguese unless the child explicitly asks for another language.",
    en: "Reply only in English unless the child explicitly asks for another language.",
    es: "Reply only in Spanish unless the child explicitly asks for another language.",
    de: "Reply only in German unless the child explicitly asks for another language.",
  }[language];
}

function localizedGuideFallback(
  language: "pt" | "en" | "es" | "de",
  age: number,
) {
  if (language === "en") {
    return buildDeterministicHomeworkFallback(age);
  }

  if (language === "pt") {
    if (age <= 8) {
      return "Vamos fazer um passo pequenino juntos. Que parte já sabes?";
    }

    if (age <= 12) {
      return "Vamos reduzir o problema a um passo mais simples. Que parte já sabes resolver?";
    }

    return "Vamos dividir isto num passo menor. Qual é a primeira parte que consegues resolver com confiança?";
  }

  if (language === "es") {
    if (age <= 8) {
      return "Vamos a hacer un paso muy pequeño juntos. ¿Qué parte ya sabes?";
    }

    if (age <= 12) {
      return "Vamos a reducir el problema a un paso más sencillo. ¿Qué parte ya sabes resolver?";
    }

    return "Vamos a dividirlo en un paso más pequeño. ¿Qué parte puedes resolver primero con seguridad?";
  }

  if (age <= 8) {
    return "Machen wir gemeinsam einen ganz kleinen Schritt. Welchen Teil kennst du schon?";
  }

  if (age <= 12) {
    return "Machen wir daraus einen kleineren Schritt. Welchen Teil kannst du schon lösen?";
  }

  return "Teilen wir das in einen kleineren Schritt. Welchen Teil kannst du zuerst sicher lösen?";
}

function localizedCheckFallback(
  language: "pt" | "en" | "es" | "de",
  age: number,
) {
  if (language === "en") {
    return buildDeterministicCheckFallback(age);
  }

  if (language === "pt") {
    if (age <= 8) {
      return "Vamos verificar a tua ideia com um passo pequeno. Que parte podemos testar primeiro?";
    }

    if (age <= 12) {
      return "Vamos verificar o teu raciocínio passo a passo. Qual passo devemos confirmar primeiro?";
    }

    return "Vamos analisar o teu raciocínio sem o substituir. Qual passo queres verificar primeiro?";
  }

  if (language === "es") {
    if (age <= 8) {
      return "Vamos a revisar tu idea con un paso pequeño. ¿Qué parte podemos comprobar primero?";
    }

    if (age <= 12) {
      return "Vamos a revisar tu razonamiento paso a paso. ¿Qué paso debemos comprobar primero?";
    }

    return "Vamos a revisar tu razonamiento sin sustituirlo. ¿Qué paso quieres comprobar primero?";
  }

  if (age <= 8) {
    return "Prüfen wir deine Idee mit einem kleinen Schritt. Welchen Teil testen wir zuerst?";
  }

  if (age <= 12) {
    return "Prüfen wir deinen Lösungsweg Schritt für Schritt. Welchen Schritt kontrollieren wir zuerst?";
  }

  return "Prüfen wir deinen Lösungsweg, ohne ihn zu ersetzen. Welchen Schritt möchtest du zuerst kontrollieren?";
}

function localizedError(
  language: "pt" | "en" | "es" | "de",
  kind: "notConfigured" | "unavailable" | "rateLimit",
) {
  const messages = {
    en: {
      notConfigured: "liio is not connected yet. Please try again later.",
      unavailable: "liio needs a moment. Please try again shortly.",
      rateLimit: "liio needs a short pause. Try again in a moment.",
    },
    pt: {
      notConfigured: "liio ainda não está ligado. Tenta novamente mais tarde.",
      unavailable: "liio precisa de um momento. Tenta novamente daqui a pouco.",
      rateLimit: "liio precisa de uma pausa curta. Tenta novamente dentro de um momento.",
    },
    es: {
      notConfigured: "liio todavía no está conectado. Inténtalo de nuevo más tarde.",
      unavailable: "liio necesita un momento. Inténtalo de nuevo en breve.",
      rateLimit: "liio necesita una pausa breve. Inténtalo de nuevo en un momento.",
    },
    de: {
      notConfigured: "liio ist noch nicht verbunden. Versuch es später erneut.",
      unavailable: "liio braucht einen Moment. Versuch es gleich noch einmal.",
      rateLimit: "liio braucht eine kurze Pause. Versuch es gleich noch einmal.",
    },
  } as const;

  return messages[language][kind];
}

async function ensureLearningSession(input: {
  deviceToken?: string;
  learningSessionId?: string;
  language: "pt" | "en" | "es" | "de";
}) {
  if (input.learningSessionId) {
    return input.learningSessionId;
  }

  if (!input.deviceToken) {
    return undefined;
  }

  const supabase = getLiioSupabaseServerClient();

  if (!supabase) {
    return undefined;
  }

  const { data, error } = await supabase.rpc(
    "liio_start_learning_session",
    {
      p_device_token: input.deviceToken,
      p_language: input.language,
      p_prompt_version: PROMPT_VERSION,
    },
  );

  if (error || typeof data !== "string") {
    return undefined;
  }

  return data;
}

async function logActivity(input: {
  deviceToken?: string;
  learningSessionId?: string;
  behavior: string;
  durationMs: number;
  success: boolean;
}) {
  if (!input.deviceToken) {
    return;
  }

  const supabase = getLiioSupabaseServerClient();

  if (!supabase) {
    return;
  }

  await supabase.rpc("liio_log_activity", {
    p_device_token: input.deviceToken,
    p_learning_session_id: input.learningSessionId ?? null,
    p_event_type: "homework_response",
    p_behavior: input.behavior,
    p_duration_ms: input.durationMs,
    p_success: input.success,
    p_prompt_version: PROMPT_VERSION,
    p_metadata: {},
  });
}

export async function POST(request: Request) {
  const startedAt = Date.now();

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        error: {
          code: "INVALID_JSON",
          message: "The request body must be valid JSON.",
        },
      },
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
          issues: parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
      },
      { status: 400 },
    );
  }

  const {
    age,
    language,
    messages,
    deviceToken,
    learningSessionId,
  } = parsed.data;

  const clientKey =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous";

  const rateLimit = consumeRateLimit(
    `homework:${clientKey}`,
    {
      limit: 20,
      windowMs: 60_000,
    },
  );

  if (!rateLimit.allowed) {
    return Response.json(
      {
        error: {
          code: "RATE_LIMITED",
          message: localizedError(language, "rateLimit"),
        },
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.max(
              1,
              Math.ceil(
                (rateLimit.resetAt - Date.now()) / 1000,
              ),
            ),
          ),
        },
      },
    );
  }

  const interaction = determineLearningInteraction(messages);

  const sessionId = await ensureLearningSession({
    deviceToken,
    learningSessionId,
    language,
  });

  try {
    const initialDraft = sanitizeDraft(
      await generateText({
        model: HOMEWORK_MODEL,
        maxTokens: 1_000,
        system: `${buildHomeworkSystemPrompt(
          age,
          interaction.behavior,
          interaction.learningRequest,
        )}

Language for this session:
${languageInstruction(language)}

Prompt version:
${PROMPT_VERSION}`,
        messages,
      }),
    );

    let finalResponse: {
      id: string;
      text: string;
    } = initialDraft;

    if (interaction.behavior === "GUIDE") {
      try {
        const initialEvaluation =
          await evaluateHomeworkCandidate({
            age,
            originalProblem:
              interaction.learningRequest,
            conversation: messages,
            candidateResponse:
              initialDraft.text,
          });

        if (!initialEvaluation.pass) {
          const regeneratedDraft =
            sanitizeDraft(
              await generateText({
                model: HOMEWORK_MODEL,
                maxTokens: 1_000,
                system: `${buildHomeworkCorrectionPrompt(
                  age,
                  interaction.learningRequest,
                  initialEvaluation.reasons,
                )}

Language for this session:
${languageInstruction(language)}

Prompt version:
${PROMPT_VERSION}`,
                messages,
              }),
            );

          const regeneratedEvaluation =
            await evaluateHomeworkCandidate({
              age,
              originalProblem:
                interaction.learningRequest,
              conversation: messages,
              candidateResponse:
                regeneratedDraft.text,
            });

          finalResponse =
            regeneratedEvaluation.pass
              ? regeneratedDraft
              : {
                  id: crypto.randomUUID(),
                  text: localizedGuideFallback(
                    language,
                    age,
                  ),
                };
        }
      } catch (evaluationError) {
        if (
          evaluationError instanceof
          AiConfigurationError
        ) {
          throw evaluationError;
        }

        console.error(
          "Homework safety evaluation failed",
          evaluationError instanceof Error
            ? evaluationError.message
            : "Unknown error",
        );

        finalResponse = {
          id: crypto.randomUUID(),
          text: localizedGuideFallback(
            language,
            age,
          ),
        };
      }
    }

    if (interaction.behavior === "CHECK") {
      try {
        const initialEvaluation =
          await evaluateHomeworkCheckCandidate({
            age,
            originalProblem:
              interaction.learningRequest,
            conversation: messages,
            candidateResponse:
              initialDraft.text,
          });

        if (!initialEvaluation.pass) {
          const regeneratedDraft =
            sanitizeDraft(
              await generateText({
                model: HOMEWORK_MODEL,
                maxTokens: 1_000,
                system: `${buildHomeworkCheckCorrectionPrompt(
                  age,
                  interaction.learningRequest,
                  initialEvaluation.reasons,
                )}

Language for this session:
${languageInstruction(language)}

Prompt version:
${PROMPT_VERSION}`,
                messages,
              }),
            );

          const regeneratedEvaluation =
            await evaluateHomeworkCheckCandidate({
              age,
              originalProblem:
                interaction.learningRequest,
              conversation: messages,
              candidateResponse:
                regeneratedDraft.text,
            });

          finalResponse =
            regeneratedEvaluation.pass
              ? regeneratedDraft
              : {
                  id: crypto.randomUUID(),
                  text: localizedCheckFallback(
                    language,
                    age,
                  ),
                };
        }
      } catch (evaluationError) {
        if (
          evaluationError instanceof
          AiConfigurationError
        ) {
          throw evaluationError;
        }

        console.error(
          "Homework CHECK evaluation failed",
          evaluationError instanceof Error
            ? evaluationError.message
            : "Unknown error",
        );

        finalResponse = {
          id: crypto.randomUUID(),
          text: localizedCheckFallback(
            language,
            age,
          ),
        };
      }
    }

    const durationMs = Date.now() - startedAt;

    void logActivity({
      deviceToken,
      learningSessionId: sessionId,
      behavior: interaction.behavior,
      durationMs,
      success: true,
    });

    console.info("liio_homework_request", {
      behavior: interaction.behavior,
      durationMs,
      promptVersion: PROMPT_VERSION,
      language,
      success: true,
    });

    return Response.json(
      {
        message: {
          id: finalResponse.id,
          role: "assistant",
          content: finalResponse.text,
        },
        learningSessionId: sessionId,
      },
      {
        headers: {
          "X-Liio-Prompt-Version":
            PROMPT_VERSION,
          "X-Liio-Duration-Ms":
            String(durationMs),
          "X-RateLimit-Remaining":
            String(rateLimit.remaining),
        },
      },
    );
  } catch (error) {
    const durationMs = Date.now() - startedAt;

    void logActivity({
      deviceToken,
      learningSessionId: sessionId,
      behavior: interaction.behavior,
      durationMs,
      success: false,
    });

    if (error instanceof AiConfigurationError) {
      return Response.json(
        {
          error: {
            code: "AI_NOT_CONFIGURED",
            message: localizedError(
              language,
              "notConfigured",
            ),
          },
        },
        { status: 503 },
      );
    }

    console.error(
      "Homework generation failed",
      error instanceof Error
        ? error.message
        : "Unknown error",
    );

    return Response.json(
      {
        error: {
          code: "AI_UNAVAILABLE",
          message: localizedError(
            language,
            "unavailable",
          ),
        },
      },
      { status: 502 },
    );
  }
}
