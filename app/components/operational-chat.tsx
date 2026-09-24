"use client";

import { AlertTriangle, ArrowUp, Bot, FileText, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { TranslationKey } from "../../lib/i18n/translations";
import { useLocale } from "./locale-provider";

type Source = { code: string; detail: string };
type ChatMessage = { id: string; role: "user" | "assistant"; content: string; sources?: Source[] };

const initialMessage: ChatMessage = { id: "welcome", role: "assistant", content: "" };

const promptKeys: TranslationKey[] = ["assistant.promptFault", "assistant.promptExplain", "assistant.promptVerify"];

export function OperationalChat() {
  const { locale, t } = useLocale();
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef(messages);
  const endRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, loading, error]);
  useEffect(() => () => controllerRef.current?.abort(), []);

  const requestReply = async (conversation: ChatMessage[]) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, messages: conversation.slice(-30).map(({ role, content }) => ({ role, content })) }),
        signal: controller.signal,
      });
      const data = await response.json() as { message?: { id?: string; content?: string }; error?: { message?: string } };
      if (!response.ok || !data.message?.content) throw new Error(data.error?.message || "AI unavailable");
      setMessages((current) => [...current, { id: data.message?.id || crypto.randomUUID(), role: "assistant", content: data.message?.content || "" }]);
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") return;
      setError(t("assistant.error"));
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

  return <section className="assistant-workspace">
    <header className="assistant-header"><div><p className="eyebrow">{t("assistant.eyebrow")}</p><h1>{t("assistant.title")}</h1><p>{t("assistant.modes")}</p></div><span className="connection-state"><span />{t("assistant.connected")}</span></header>
    <div className="assistant-notice"><ShieldCheck size={18} /><span>{t("assistant.safety")}</span></div>
    <div className="chat-layout">
      <section className="operational-chat" aria-label={t("assistant.conversation")} aria-live="polite">
        {messages.map((message) => <article className={`op-message op-message--${message.role}`} key={message.id}>{message.role === "assistant" && <span className="op-avatar"><Bot size={18} /></span>}<div><div className="op-bubble">{message.id === "welcome" ? t("assistant.welcome") : message.content}</div>{message.sources && <div className="source-list"><strong>{t("assistant.sources")}</strong>{message.sources.map((source) => <span key={source.code}><FileText size={14} />{source.code} · {source.detail}</span>)}</div>}</div></article>)}
        {messages.length === 1 && !loading && <div className="chat-prompts">{promptKeys.map((key) => <button onClick={() => sendMessage(t(key))} key={key}>{t(key)}</button>)}</div>}
        {loading && <article className="op-message op-message--assistant"><span className="op-avatar"><Bot size={18} /></span><div className="op-bubble op-thinking" aria-label={t("assistant.analyzing")}><span /><span /><span /></div></article>}
        {error && <div className="op-error" role="alert"><AlertTriangle size={18} /><span>{error}</span><button onClick={() => void requestReply(messagesRef.current)}>{t("assistant.retry")}</button></div>}
        <div ref={endRef} />
      </section>
      <form className="op-composer" onSubmit={onSubmit}><div><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(input); } }} placeholder={t("assistant.placeholder")} rows={2} maxLength={4000} disabled={loading} aria-label={t("assistant.placeholder")} /><button type="submit" aria-label={t("assistant.send")} disabled={loading || !input.trim()}><ArrowUp size={20} /></button></div><p>{t("assistant.noRetrieval")}</p></form>
    </div>
  </section>;
}
