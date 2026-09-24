import type { OperationalMessage } from "./operations";

export type OperationalBehavior = "EXPLAIN" | "GUIDE" | "VERIFY";
export type OperationalInteraction = { behavior: OperationalBehavior; operationalRequest: string };

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

const verifyPatterns = [
  /\b(?:i|we) (?:measured|observed|checked|completed|found|recorded)\b/,
  /\b(?:reading|measurement|observation|result) (?:is|was|shows?)\b/,
  /\b(?:verify|validate|check|review|confirm) (?:this|my|the)\b/,
  /\b(?:is this|does this).{0,24}(?:consistent|expected|correct|normal)\b/,
  /\b(?:medi|medimos|observe|observamos|comprobe|comprobamos|registre|registramos)\b/,
  /\b(?:verifica|validar|revisa|confirmar) (?:esto|mi|el|la)\b/,
  /\b(?:ich|wir).{0,80}\b(?:gemessen|beobachtet|gepruft|abgeschlossen|festgestellt|erfasst)\b/,
  /\b(?:prufe|uberprufe|validiere|bestatige) (?:das|dies|meine|den|die)\b/,
];

const guidePatterns = [
  /\b(?:troubleshoot|investigate|diagnose|walk me through|guide me|what should i check|next step)\b/,
  /\b(?:stopped|fault|error|alarm|failure|trip|not running|won't start|will not start|overheating|leaking)\b/,
  /\b(?:how do i|how should i).{0,30}(?:check|inspect|investigate|respond|proceed)\b/,
  /\b(?:diagnosticar|investigar|guiame|que debo revisar|siguiente paso)\b/,
  /\b(?:se detuvo|fallo|error|alarma|averia|no arranca|sobrecalentamiento|fuga)\b/,
  /\b(?:fehleranalyse|untersuchen|fuhre mich|was soll ich prufen|nachster schritt)\b/,
  /\b(?:gestoppt|fehler|alarm|storung|ausfall|startet nicht|uberhitzt|undicht)\b/,
];

const modifierPatterns = [
  /^(?:i don't understand|i do not understand|not clear|say that differently|simplify|what next|then what|done|completed|yes|no)\b/,
  /^(?:nao entendi|não entendi|explique diferente|simplifique|e agora|feito|concluido|concluído|sim|nao|não)\b/,
  /^(?:no entiendo|no lo entiendo|no esta claro|explicalo diferente|simplifica|y ahora|hecho|completado|si|no)\b/,
  /^(?:ich verstehe nicht|nicht klar|anders erklaren|vereinfache|wie weiter|und dann|fertig|abgeschlossen|ja|nein)\b/,
];

function directBehavior(content: string): OperationalBehavior {
  const value = normalize(content);
  if (verifyPatterns.some((pattern) => pattern.test(value))) return "VERIFY";
  if (guidePatterns.some((pattern) => pattern.test(value))) return "GUIDE";
  return "EXPLAIN";
}

function isModifier(content: string) {
  const value = normalize(content);
  return value.length < 100 && modifierPatterns.some((pattern) => pattern.test(value));
}

export function determineOperationalInteraction(messages: OperationalMessage[]): OperationalInteraction {
  const users = messages.map((message, index) => ({ ...message, index })).filter((message) => message.role === "user");
  const latest = users.at(-1);
  if (!latest) return { behavior: "EXPLAIN", operationalRequest: "" };
  if (!isModifier(latest.content)) return { behavior: directBehavior(latest.content), operationalRequest: latest.content };

  for (let index = users.length - 2; index >= 0; index -= 1) {
    const previous = users[index];
    if (!isModifier(previous.content)) return { behavior: directBehavior(previous.content), operationalRequest: previous.content };
  }
  return { behavior: "EXPLAIN", operationalRequest: latest.content };
}
