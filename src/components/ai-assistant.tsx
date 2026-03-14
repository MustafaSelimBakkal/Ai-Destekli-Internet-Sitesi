"use client";

import { type FormEvent, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AIAssistant() {
  const [question, setQuestion] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Cizimlerinle ilgili sana nasil yardimci olabilirim?"
    }
  ]);

  async function handleAsk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) {
      return;
    }

    const userMessage: Message = { role: "user", content: question.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: userMessage.content,
          drawingContext: context
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "AI yaniti alinamadi.");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Bilinmeyen hata";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Uzgunum, bir sorun oldu: ${errorMessage}` }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="glass-card assistant-card">
      <h2>AI Cizim Asistani</h2>
      <p>Yorum, fikir, portfolyo metni veya stil onerisi isteyebilirsin.</p>

      <div className="chat-box">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={message.role === "assistant" ? "bubble assistant" : "bubble user"}
          >
            {message.content}
          </div>
        ))}
      </div>

      <form className="stack" onSubmit={handleAsk}>
        <label>
          Cizim baglami (opsiyonel)
          <input
            type="text"
            placeholder="Ornek: Dijital anime karakter, pastel tonlar"
            value={context}
            onChange={(event) => setContext(event.target.value)}
          />
        </label>
        <label>
          Sorun
          <textarea
            rows={3}
            required
            placeholder="Ornek: Bu cizime kompozisyon acisindan gelisim onerisi ver"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
          />
        </label>
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Yanit hazirlaniyor..." : "Soruyu Gonder"}
        </button>
      </form>
    </section>
  );
}
