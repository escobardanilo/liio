"use client";

import Link from "next/link";
import { BookOpen, ChevronLeft, Gamepad2, Send } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Brand } from "./ui";
import { Mascot } from "./mascot";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const CHILD_AGE = 9;
const initialMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Hey Andrew, what do you want to work on today?",
};

export function HomeworkChat() {
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
      const response = await fetch("/api/ai/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: CHILD_AGE,
          messages: conversation.slice(-40).map(({ role, content }) => ({ role, content })),
        }),
        signal: controller.signal,
      });
      const data = await response.json() as { message?: { id?: string; content?: string }; error?: { message?: string } };

      if (!response.ok || !data.message?.content) {
        throw new Error(data.error?.message || "Liio could not answer right now.");
      }

      setMessages((current) => [...current, {
        id: data.message?.id || crypto.randomUUID(),
        role: "assistant",
        content: data.message?.content || "",
      }]);
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") return;
      setError(requestError instanceof Error ? requestError.message : "Liio needs a moment. Please try again.");
    } finally {
      if (controllerRef.current === controller) setLoading(false);
    }
  };

  const sendMessage = (content: string) => {
    const cleanContent = content.trim();
    if (!cleanContent || loading) return;
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: cleanContent };
    const conversation = [...messagesRef.current, userMessage];
    messagesRef.current = conversation;
    setMessages(conversation);
    setInput("");
    void requestReply(conversation);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    sendMessage(input);
  };

  return <main className="app-shell app-shell--fixed homework-screen">
    <header className="homework-header">
      <Link className="icon-button" href="/home-01" aria-label="Go back"><ChevronLeft size={31} strokeWidth={2.5} /></Link>
      <div className="homework-header__brand"><Brand small /><span className="mode-pill"><BookOpen size={13} />Homework</span></div>
      <Link className="icon-button" href="/game" aria-label="Play game"><Gamepad2 size={27} strokeWidth={2.2} /></Link>
    </header>

    <section className="chat-history" aria-label="Homework conversation" aria-live="polite">
      {messages.map((message) => <article className={`chat-message chat-message--${message.role}`} key={message.id}>
        {message.role === "assistant" && <div className="chat-avatar"><Mascot width={34} height={28} /></div>}
        <div className="chat-bubble">{message.content}</div>
      </article>)}

      {messages.length === 1 && !loading && <div className="prompt-chips">
        <button onClick={() => sendMessage("I'm stuck on a fractions question.")}>Help with fractions</button>
        <button onClick={() => sendMessage("Can you guide me through an equation?")}>Guide an equation</button>
        <button onClick={() => sendMessage("I don't understand this homework step.")}>Explain a step</button>
      </div>}

      {loading && <article className="chat-message chat-message--assistant">
        <div className="chat-avatar"><Mascot width={34} height={28} thinking /></div>
        <div className="chat-bubble thinking-bubble" aria-label="Liio is thinking"><span /><span /><span /></div>
      </article>}

      {error && <div className="chat-error" role="alert"><span>{error}</span><button onClick={() => void requestReply(messagesRef.current)}>Try again</button></div>}
      <div ref={endRef} />
    </section>

    <form className="chat-composer" onSubmit={onSubmit}>
      <div className="chat-input-wrap">
        <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(input); }
        }} placeholder="Ask about your homework…" rows={1} maxLength={4000} disabled={loading} aria-label="Homework message" />
        <button type="submit" aria-label="Send message" disabled={loading || !input.trim()}><Send size={21} /></button>
      </div>
      <p>Liio will guide you one step at a time.</p>
    </form>
  </main>;
}
