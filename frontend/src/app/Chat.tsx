"use client";

import { useState } from "react";

export default function Chat() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");

  const handleSendQuestion = async () => {
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      setResponse(data.answer);
    } catch (error) {
      console.error("Erro ao enviar a pergunta:", error);
    }
  };

  return (
    <div>
      <h1>Chat</h1>
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Digite sua pergunta"
      />
      <button onClick={handleSendQuestion}>Enviar</button>
      <div>
        <h2>Resposta:</h2>
        <p>{response}</p>
      </div>
    </div>
  );
}
