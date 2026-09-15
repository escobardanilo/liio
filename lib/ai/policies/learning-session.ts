import type { HomeworkMessage } from "./homework";

export type LearningBehavior = "EXPLAIN" | "GUIDE" | "CHECK";

export type LearningInteraction = {
  behavior: LearningBehavior;
  learningRequest: string;
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

const modifierPatterns = [
  /\bnao entendi\b/, /\bnao percebi\b/, /\bnao compreendi\b/, /\bnao sei\b/,
  /\bi do not understand\b/, /\bi don't understand\b/, /\bi am confused\b/, /\bi'm confused\b/,
  /\bi do not know\b/, /\bi don't know\b/, /\bexplain (it|that) differently\b/,
  /\bexplica (isso |isto )?(de outra forma|diferente|melhor)\b/,
  /\b(make|faz|torna).{0,12}(easier|mais facil|simpler|mais simples)\b/,
  /\b(give me|me da|de-me|quero).{0,12}(a hint|uma dica|dica)\b/,
  /\b(speak|answer|respond|fala|fale|responde|responda).{0,18}(portuguese|portugues|english|ingles|spanish|espanhol|french|frances)\b/,
];

const checkPatterns = [
  /\bi think\b/, /\bmy (answer|reasoning|solution|paragraph)\b/,
  /\b(is (this|that|it)|am i).{0,12}(right|correct)\b/, /\bdoes this.{0,24}(answer|solve|explain)\b/,
  /\bcheck my\b/, /\bacho que\b/, /\bminha (resposta|solucao|explicacao)\b/,
  /\b(isto|isso|esta).{0,12}(certo|correto)\b/,
  /\b(verifica|verifique|corrige|corrija).{0,18}(resposta|solucao|raciocinio|texto)\b/,
];

const guidePatterns = [
  /\b(solve|calculate|compute|work out)\b/, /\b(give|tell|write|show) me.{0,24}(answer|final answer|solution)\b/,
  /\b(homework|exercise|worksheet).{0,24}(answer|problem|question|task)\b/,
  /\b(resolva|resolve|calcule|calcula)\b/, /\b(me diga|diz-me|me de|escreva).{0,24}(resposta|resultado|solucao)\b/,
  /\b(resposta final|exercicio|problema|equacao|tarefa)\b/,
];

const mathematicalTaskPatterns = [
  /\d+(?:[.,]\d+)?\s*[+\-*/×÷x]\s*\d+(?:[.,]\d+)?/,
  /\b[a-z]\s*[+\-*/]\s*\d+(?:[.,]\d+)?\s*=\s*-?\d+(?:[.,]\d+)?\b/,
  /\b\d+(?:[.,]\d+)?\s*=\s*[a-z]\b/,
];

const newRequestPatterns = [
  /^(what|why|how|when|where|who|explain|define|describe|solve|calculate|compute)\b/,
  /\b(can|could|would|will) you\b/,
  /\b(give|tell|show|write) me\b/,
  /^(o que|por que|porque|como|quando|onde|quem|explica|explique|define|descreve|descreva|resolve|resolva|calcula|calcule)\b/,
  /\b(pode|consegue|poderia) (me )?(explicar|dizer|mostrar|resolver|calcular)\b/,
  /\b(me diga|diz-me|me mostre|mostra-me|escreva)\b/,
];

export function isLearningModifier(content: string) {
  const normalized = normalize(content);
  return modifierPatterns.some((pattern) => pattern.test(normalized));
}

function directBehavior(content: string): LearningBehavior {
  const normalized = normalize(content);
  if (checkPatterns.some((pattern) => pattern.test(normalized))) return "CHECK";
  if (mathematicalTaskPatterns.some((pattern) => pattern.test(normalized)) || guidePatterns.some((pattern) => pattern.test(normalized))) return "GUIDE";
  return "EXPLAIN";
}

function isContinuation(messages: HomeworkMessage[], messageIndex: number) {
  const message = messages[messageIndex];
  if (message.role !== "user") return false;
  if (isLearningModifier(message.content)) return true;
  if (messages[messageIndex - 1]?.role !== "assistant") return false;
  if (directBehavior(message.content) === "CHECK") return false;

  const normalized = normalize(message.content);
  const startsNewRequest = newRequestPatterns.some((pattern) => pattern.test(normalized));
  return !startsNewRequest;
}

export function determineLearningInteraction(messages: HomeworkMessage[]): LearningInteraction {
  const userMessages = messages
    .map((message, index) => ({ ...message, index }))
    .filter((message) => message.role === "user");
  const latest = userMessages.at(-1);
  if (!latest) return { behavior: "EXPLAIN", learningRequest: "" };

  const inheritsSession = isContinuation(messages, latest.index);
  if (!inheritsSession) return { behavior: directBehavior(latest.content), learningRequest: latest.content };

  for (let index = userMessages.length - 2; index >= 0; index -= 1) {
    const previous = userMessages[index];
    if (!isContinuation(messages, previous.index)) {
      return { behavior: directBehavior(previous.content), learningRequest: previous.content };
    }
  }

  return { behavior: directBehavior(latest.content), learningRequest: latest.content };
}
