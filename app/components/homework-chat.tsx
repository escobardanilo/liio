"use client";

import Link from "next/link";
import { liioCopy } from "@/lib/i18n/catalog";
import { BookOpen, ChevronLeft, Gamepad2, Send } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Brand } from "./ui";
import { Mascot } from "./mascot";
import { getDeviceIdentity } from "@/lib/services/pairing-service";
import { getActiveChildProfile } from "@/lib/services/local-state";
import { useLiioLanguage } from "./use-liio-language";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ActiveChildProfile = {
  childId: string | null;
  name: string | null;
  initial: string;
  age: number;
  pairedAt: string;
};

const copy = liioCopy.homework;


export function HomeworkChat() {
  const { language, ready: languageReady } = useLiioLanguage();
  const t = copy[language];

  const [child, setChild] = useState<ActiveChildProfile>({
    childId: null,
    name: null,
    initial: "",
    age: 9,
    pairedAt: "",
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const initializedRef = useRef(false);
  const learningSessionIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!languageReady || initializedRef.current) {
      return;
    }

    let childName = language === "pt" ? "aí" : language === "es" ? "ahí" : language === "de" ? "du" : "there";
    let childAge = 9;

    try {
      const parsedProfile = getActiveChildProfile();

      if (parsedProfile) {

        childName = parsedProfile.name?.trim() || childName;
        childAge =
          Number.isInteger(parsedProfile.age) &&
          parsedProfile.age >= 6 &&
          parsedProfile.age <= 15
            ? parsedProfile.age
            : 9;

        setChild({
          ...parsedProfile,
          name: childName,
          age: childAge,
        });
      }
    } catch {
      // Use the safe defaults above.
    }

    const welcomeMessage: ChatMessage = {
      id: "welcome",
      role: "assistant",
      content: t.welcome(childName),
    };

    initializedRef.current = true;
    messagesRef.current = [welcomeMessage];
    setMessages([welcomeMessage]);
  }, [language, languageReady, t]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading, error]);

  useEffect(
    () => () => controllerRef.current?.abort(),
    [],
  );

  const requestReply = async (conversation: ChatMessage[]) => {
    controllerRef.current?.abort();

    const controller = new AbortController();

    controllerRef.current = controller;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/homework", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          age: child.age,
          language,
          deviceToken: getDeviceIdentity()?.token,
          learningSessionId: learningSessionIdRef.current,
          messages: conversation
            .slice(-40)
            .map(({ role, content }) => ({
              role,
              content,
            })),
        }),
        signal: controller.signal,
      });

      const data = (await response.json()) as {
        message?: {
          id?: string;
          content?: string;
        };
        learningSessionId?: string;
        error?: {
          message?: string;
        };
      };

      if (data.learningSessionId) {
        learningSessionIdRef.current =
          data.learningSessionId;
      }

      if (!response.ok || !data.message?.content) {
        throw new Error(
          data.error?.message || t.unavailable,
        );
      }

      setMessages((current) => [
        ...current,
        {
          id: data.message?.id || crypto.randomUUID(),
          role: "assistant",
          content: data.message?.content || "",
        },
      ]);
    } catch (requestError) {
      if (
        requestError instanceof DOMException &&
        requestError.name === "AbortError"
      ) {
        return;
      }

      setError(
        requestError instanceof Error
          ? requestError.message
          : t.moment,
      );
    } finally {
      if (controllerRef.current === controller) {
        setLoading(false);
      }
    }
  };

  const sendMessage = (content: string) => {
    const cleanContent = content.trim();

    if (!cleanContent || loading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: cleanContent,
    };

    const conversation = [
      ...messagesRef.current,
      userMessage,
    ];

    messagesRef.current = conversation;
    setMessages(conversation);
    setInput("");

    void requestReply(conversation);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    sendMessage(input);
  };

  return (
    <main className="app-shell app-shell--fixed homework-screen">
      <header className="homework-header">
        <Link
          className="icon-button"
          href="/home-01"
          aria-label="Go back"
        >
          <ChevronLeft size={31} strokeWidth={2.5} />
        </Link>

        <div className="homework-header__brand">
          <Brand small />

          <span className="mode-pill">
            <BookOpen size={13} />
            {t.mode}
          </span>
        </div>

        <Link
          className="icon-button"
          href="/game"
          aria-label="Play game"
        >
          <Gamepad2 size={27} strokeWidth={2.2} />
        </Link>
      </header>

      <section
        className="chat-history"
        aria-label="Homework conversation"
        aria-live="polite"
      >
        {messages.map((message) => (
          <article
            className={`chat-message chat-message--${message.role}`}
            key={message.id}
          >
            {message.role === "assistant" && (
              <div className="chat-avatar">
                <Mascot width={34} height={28} />
              </div>
            )}

            <div className="chat-bubble">
              {message.content}
            </div>
          </article>
        ))}

        {messages.length === 1 && !loading && (
          <div className="prompt-chips">
            <button
              type="button"
              onClick={() => sendMessage(t.fractionsPrompt)}
            >
              {t.fractions}
            </button>

            <button
              type="button"
              onClick={() => sendMessage(t.equationPrompt)}
            >
              {t.equation}
            </button>

            <button
              type="button"
              onClick={() => sendMessage(t.explainPrompt)}
            >
              {t.explain}
            </button>
          </div>
        )}

        {loading && (
          <article className="chat-message chat-message--assistant">
            <div className="chat-avatar">
              <Mascot
                width={34}
                height={28}
                thinking
              />
            </div>

            <div
              className="chat-bubble thinking-bubble"
              aria-label={t.thinking}
            >
              <span />
              <span />
              <span />
            </div>
          </article>
        )}

        {error && (
          <div className="chat-error" role="alert">
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                void requestReply(
                  messagesRef.current,
                )
              }
            >
              {t.retry}
            </button>
          </div>
        )}

        <div ref={endRef} />
      </section>

      <form
        className="chat-composer"
        onSubmit={onSubmit}
      >
        <div className="chat-input-wrap">
          <textarea
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder={t.placeholder}
            rows={1}
            maxLength={4000}
            disabled={loading}
            aria-label="Homework message"
          />

          <button
            type="submit"
            aria-label="Send message"
            disabled={loading || !input.trim()}
          >
            <Send size={21} />
          </button>
        </div>

        <p>{t.footer}</p>
      </form>
    </main>
  );
}
