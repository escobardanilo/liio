"use client";

import { AlertTriangle, ArrowUp, Bot, FileText, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

type Source = { code: string; detail: string };
type ChatMessage = { id: string; role: "user" | "assistant"; content: string; sources?: Source[] };

const initialMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Describe the equipment, alarm, observation or procedure you need help with. I’ll keep guidance focused and flag when an authorized person must take over.",
};

const prompts = [
  "Line 3 stopped and is showing error E42.",
  "Explain what a pressure interlock does.",
  "I measured 6.2 bar at Pump P-204. Help me verify the observation.",
];

export function OperationalChat() {
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
        body: JSON.stringify({ messages: conversation.slice(-30).map(({ role, content }) => ({ role, content })) }),
        signal: controller.signal,
      });
      const data = await response.json() as { message?: { id?: string; content?: string }; error?: { message?: string } };
      if (!response.ok || !data.message?.content) throw new Error(data.error?.message || "SON could not respond right now.");
      setMessages((current) => [...current, { id: data.message?.id || crypto.randomUUID(), role: "assistant", content: data.message?.content || "" }]);
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") return;
      setError(requestError instanceof Error ? requestError.message : "SON is temporarily unavailable. Try again.");
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
    <header className="assistant-header"><div><p className="eyebrow">Operational Assistant</p><h1>Ask SON</h1><p>Explain · Guide · Verify</p></div><span className="connection-state"><span />AI connected</span></header>
    <div className="assistant-notice"><ShieldCheck size={18} /><span>SON provides information and guidance only. Safety-critical or authorized actions must be escalated to the responsible human role.</span></div>
    <div className="chat-layout">
      <section className="operational-chat" aria-label="Operational conversation" aria-live="polite">
        {messages.map((message) => <article className={`op-message op-message--${message.role}`} key={message.id}>{message.role === "assistant" && <span className="op-avatar"><Bot size={18} /></span>}<div><div className="op-bubble">{message.content}</div>{message.sources && <div className="source-list"><strong>Sources</strong>{message.sources.map((source) => <span key={source.code}><FileText size={14} />{source.code} · {source.detail}</span>)}</div>}</div></article>)}
        {messages.length === 1 && !loading && <div className="chat-prompts">{prompts.map((prompt) => <button onClick={() => sendMessage(prompt)} key={prompt}>{prompt}</button>)}</div>}
        {loading && <article className="op-message op-message--assistant"><span className="op-avatar"><Bot size={18} /></span><div className="op-bubble op-thinking" aria-label="SON is analyzing"><span /><span /><span /></div></article>}
        {error && <div className="op-error" role="alert"><AlertTriangle size={18} /><span>{error}</span><button onClick={() => void requestReply(messagesRef.current)}>Retry</button></div>}
        <div ref={endRef} />
      </section>
      <form className="op-composer" onSubmit={onSubmit}><div><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(input); } }} placeholder="Describe an operational issue, observation or procedure…" rows={2} maxLength={4000} disabled={loading} aria-label="Operational message" /><button type="submit" aria-label="Send message" disabled={loading || !input.trim()}><ArrowUp size={20} /></button></div><p>No live equipment or document retrieval is connected in this demonstration.</p></form>
    </div>
  </section>;
}
