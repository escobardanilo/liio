import "server-only";
import Groq from "groq-sdk";

let groqClient: Groq | undefined;

export type AiMessage = {
  role: "user" | "assistant";
  content: string;
};

type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
};

export class AiConfigurationError extends Error {
  constructor() {
    super("The Groq API key is not configured.");
    this.name = "AiConfigurationError";
  }
}

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new AiConfigurationError();
  }

  groqClient ??= new Groq({ apiKey });
  return groqClient;
}

export async function generateText(input: {
  model: string;
  maxTokens: number;
  system: string;
  messages: AiMessage[];
}) {
  const response = await getGroqClient().chat.completions.create({
    model: input.model,
    max_completion_tokens: input.maxTokens,
    messages: [
      { role: "system", content: input.system },
      ...input.messages,
    ],
  });

  const choice = response.choices[0];
  const text = choice?.message.content?.trim() ?? "";

  if (!text) {
    throw new Error("The model returned no text content.");
  }

  return {
    id: response.id,
    text,
    stopReason: choice.finish_reason,
  };
}

export async function generateStructuredText(input: {
  model: string;
  maxTokens: number;
  system: string;
  prompt: string;
  jsonSchema: JsonSchema;
}) {
  const response = await getGroqClient().chat.completions.create({
    model: input.model,
    max_completion_tokens: input.maxTokens,
    temperature: 0,
    messages: [
      { role: "system", content: input.system },
      { role: "user", content: input.prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: input.jsonSchema.name,
        strict: true,
        schema: input.jsonSchema.schema,
      },
    },
  });

  const choice = response.choices[0];
  const text = choice?.message.content?.trim() ?? "";

  if (!text) {
    throw new Error("The model returned no structured content.");
  }

  return {
    id: response.id,
    text,
    stopReason: choice.finish_reason,
  };
}
