"use client";

import Link from "next/link";
import { BookOpen, ChevronLeft, Gamepad2, Send } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Brand } from "./ui";
import { Mascot } from "./mascot";
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

const ACTIVE_CHILD_KEY = "liio-active-child-profile";

const copy = {
  en: {
    mode: "Homework",
    welcome: (name: string) => `Hey ${name}, what do you want to work on today?`,
    fractions: "Help with fractions",
    fractionsPrompt: "I'm stuck on a fractions question.",
    equation: "Guide an equation",
    equationPrompt: "Can you guide me through an equation?",
    explain: "Explain a step",
    explainPrompt: "I don't understand this homework step.",
    placeholder: "Ask about your homework…",
    footer: "liio will guide you one step at a time.",
    retry: "Try again",
    unavailable: "liio could not answer right now.",
    moment: "liio needs a moment. Please try again.",
    thinking: "liio is thinking",
  },
  pt: {
    mode: "Tarefas",
    welcome: (name: string) => `Olá ${name}, no que queres trabalhar hoje?`,
    fractions: "Ajuda com frações",
    fractionsPrompt: "Estou com dificuldade numa questão de frações.",
    equation: "Orientar uma equação",
    equationPrompt: "Podes orientar-me numa equação?",
    explain: "Explicar um passo",
    explainPrompt: "Não estou a perceber este passo do trabalho.",
    placeholder: "Pergunta sobre o teu trabalho…",
    footer: "liio vai orientar-te um passo de cada vez.",
    retry: "Tentar novamente",
    unavailable: "liio não conseguiu responder agora.",
    moment: "liio precisa de um momento. Tenta novamente.",
    thinking: "liio está a pensar",
  },
  es: {
    mode: "Tareas",
    welcome: (name: string) => `Hola ${name}, ¿en qué quieres trabajar hoy?`,
    fractions: "Ayuda con fracciones",
    fractionsPrompt: "Estoy atascado con una pregunta de fracciones.",
    equation: "Guiar una ecuación",
    equationPrompt: "¿Puedes guiarme con una ecuación?",
    explain: "Explicar un paso",
    explainPrompt: "No entiendo este paso de la tarea.",
    placeholder: "Pregunta sobre tu tarea…",
    footer: "liio te guiará paso a paso.",
    retry: "Intentar de nuevo",
    unavailable: "liio no pudo responder ahora.",
    moment: "liio necesita un momento. Inténtalo de nuevo.",
    thinking: "liio está pensando",
  },
  de: {
    mode: "Hausaufgaben",
    welcome: (name: string) => `Hallo ${name}, woran möchtest du heute arbeiten?`,
    fractions: "Hilfe mit Brüchen",
    fractionsPrompt: "Ich komme bei einer Bruchaufgabe nicht weiter.",
    equation: "Gleichung begleiten",
    equationPrompt: "Kannst du mich durch eine Gleichung führen?",
    explain: "Einen Schritt erklären",
    explainPrompt: "Ich verstehe diesen Schritt der Aufgabe nicht.",
    placeholder: "Frag zu deinen Hausaufgaben…",
    footer: "liio begleitet dich Schritt für Schritt.",
    retry: "Erneut versuchen",
    unavailable: "liio konnte gerade nicht antworten.",
    moment: "liio braucht einen Moment. Versuch es erneut.",
    thinking: "liio denkt nach",
  },
} as const;

export function HomeworkChat() {
  const { language } = useLiioLanguage();
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

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    let childName = language === "pt" ? "aí" : language === "es" ? "ahí" : language === "de" ? "du" : "there";
    let childAge = 9;

    try {
      const storedProfile = window.localStorage.getItem(ACTIVE_CHILD_KEY);

      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile) as ActiveChildProfile;

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
  }, [language, t]);

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
        error?: {
          message?: string;
        };
      };

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
