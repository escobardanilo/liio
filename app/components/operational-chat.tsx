"use client";

import { AlertTriangle, ArrowUp, Bot, FileText, Gauge, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { buildOperationalConversation } from "../../lib/ai/conversation/operational-conversation";
import type { TranslationKey } from "../../lib/i18n/translations";
import { useLocale } from "./locale-provider";

type Source = { code: string; detail: string };
type ChatMessage = { id: string; role: "user" | "assistant"; content: string; sources?: Source[] };
type ConnectionState = "idle" | "processing" | "available" | "error";

const initialMessage: ChatMessage = { id: "welcome", role: "assistant", content: "" };

const promptKeys: TranslationKey[] = ["assistant.promptFault", "assistant.promptExplain", "assistant.promptVerify"];

export function OperationalChat() {
  const { locale, t } = useLocale();
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connection, setConnection] = useState<ConnectionState>("idle");
  const messagesRef = useRef(messages);
  const endRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, loading, error]);
  useEffect(() => () => controllerRef.current?.abort(), []);
  useEffect(() => { const pending = window.sessionStorage.getItem("son-command"); if (pending) { window.sessionStorage.removeItem("son-command"); queueMicrotask(() => setInput(pending)); } }, []);

  const requestReply = async (conversation: ChatMessage[]) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const validConversation = buildOperationalConversation(conversation);
    if (!validConversation.length || validConversation.at(-1)?.role !== "user") return;
    setLoading(true);
    setConnection("processing");
    setError(null);
    try {
      const response = await fetch("/api/ai/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, messages: validConversation }),
        signal: controller.signal,
      });
      const data = await response.json() as { message?: { id?: string; content?: string }; error?: { message?: string } };
      if (!response.ok || !data.message?.content) throw new Error(data.error?.message || "AI unavailable");
      setMessages((current) => [...current, { id: data.message?.id || crypto.randomUUID(), role: "assistant", content: data.message?.content || "" }]);
      setConnection("available");
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") return;
      setError(t("assistant.error"));
      setConnection("error");
    } finally {
      if (controllerRef.current === controller) setLoading(false);
    }
  };

  const sendMessage = (content: string) => {
    const clean = content.trim();
    if (!clean || loading) return;
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: clean };
    const conversation = [...messagesRef.current, userMessage];
    messagesRef.current = conversation;
    setMessages(conversation);
    setInput("");
    void requestReply(conversation);
  };

  const onSubmit = (event: FormEvent) => { event.preventDefault(); sendMessage(input); };

  const stateLabel = connection === "processing" ? t("assistant.processing") : connection === "available" ? t("assistant.available") : connection === "error" ? t("assistant.unavailable") : t("assistant.ready");

  return <section className="assistant-workspace">
    <header className="assistant-tool-header"><div><p className="eyebrow">{t("assistant.eyebrow")}</p><h1>{t("assistant.title")}</h1></div><span className={`connection-state connection-state--${connection}`}><span />{stateLabel}</span></header>
    <div className="assistant-notice"><ShieldCheck size={18} /><span>{t("assistant.safety")}</span></div>
    <div className="assistant-console">
      <div className="chat-layout"><section className="operational-chat" aria-label={t("assistant.conversation")} aria-live="polite">
        {messages.map((message) => <article className={`op-message op-message--${message.role}`} key={message.id}>{message.role === "assistant" && <span className="op-avatar"><Bot size={18} /></span>}<div><div className="op-bubble">{message.id === "welcome" ? t("assistant.welcome") : message.content}</div>{message.sources && <div className="source-list"><strong>{t("assistant.sources")}</strong>{message.sources.map((source) => <span key={source.code}><FileText size={14} />{source.code} · {source.detail}</span>)}</div>}</div></article>)}
        {messages.length === 1 && !loading && <div className="chat-prompts">{promptKeys.map((key) => <button onClick={() => sendMessage(t(key))} key={key}>{t(key)}</button>)}</div>}
        {loading && <article className="op-message op-message--assistant"><span className="op-avatar"><Bot size={18} /></span><div className="op-bubble op-thinking" aria-label={t("assistant.analyzing")}><span /><span /><span /></div></article>}
        {error && <div className="op-error" role="alert"><AlertTriangle size={18} /><span>{error}</span><button onClick={() => void requestReply(messagesRef.current)}>{t("assistant.retry")}</button></div>}
        <div ref={endRef} />
      </section><form className="op-composer" onSubmit={onSubmit}><div><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(input); } }} placeholder={t("assistant.placeholder")} rows={2} maxLength={4000} disabled={loading} aria-label={t("assistant.placeholder")} /><button type="submit" aria-label={t("assistant.send")} disabled={loading || !input.trim()}><ArrowUp size={20} /></button></div><p>{t("assistant.noRetrieval")}</p></form></div>
      <aside className="assistant-context"><div className="context-panel__heading"><Gauge size={18} /><strong>{t("assistant.context")}</strong></div><dl><div><dt>{t("assistant.session")}</dt><dd>{t("assistant.sessionActive")}</dd></div><div><dt>{t("assistant.mode")}</dt><dd>{t("assistant.autoMode")}</dd></div><div><dt>{t("assistant.equipmentContext")}</dt><dd>{t("assistant.notSelected")}</dd></div><div><dt>{t("assistant.sourceAccess")}</dt><dd>{t("assistant.notConnected")}</dd></div><div><dt>{t("assistant.escalation")}</dt><dd>{t("assistant.none")}</dd></div></dl><div className="context-warning"><FileText size={16} /><span>{t("assistant.noRetrieval")}</span></div></aside>
    </div>
  </section>;
}
