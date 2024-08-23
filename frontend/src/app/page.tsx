"use client";

import { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

export default function Home() {
  const [question, setQuestion] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [filename, setFilename] = useState<string | null>(null);
  const interactionsRef = useRef<HTMLDivElement>(null);

  // Função para rolar a página até o final das mensagens
  const scrollToBottom = () => {
    if (interactionsRef.current) {
      interactionsRef.current.scrollTop = interactionsRef.current.scrollHeight;
    }
  };

  // Carregar o conteúdo da div interactions e filename do localStorage ao carregar a página
  useEffect(() => {
    const savedInteractions = localStorage.getItem("interactionsContent");
    const savedFilename = localStorage.getItem("uploadedFilename");

    if (savedInteractions && interactionsRef.current) {
      interactionsRef.current.innerHTML = savedInteractions;
    }
    if (savedFilename) {
      setFilename(savedFilename);
    }
    scrollToBottom();
  }, []);

  // Salvar o conteúdo da div interactions no localStorage sempre que ele for atualizado
  useEffect(() => {
    if (interactionsRef.current) {
      localStorage.setItem(
        "interactionsContent",
        interactionsRef.current.innerHTML
      );
    }
    scrollToBottom();
  }, [response]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!question || (!file && !filename)) {
      toast.error("Por favor, preencha a pergunta e selecione um arquivo PDF.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    if (file) formData.append("file", file);
    formData.append("question", question);
    if (filename) formData.append("filename", filename);

    const currentDateTime = new Date().toLocaleString();

    try {
      const res = await fetch("http://localhost:3000/api/upload-and-ask", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Erro ao enviar o arquivo e a pergunta");
      }

      const data = await res.json();
      setResponse(data.answer);

      if (interactionsRef.current) {
        interactionsRef.current.innerHTML += `
          <div class="resposta">
            <p><strong>Usuário diz:</strong> ${question}</p>
            <p><small>${currentDateTime}</small></p>
            <p><strong>PDF Genius diz:</strong><br>${data.answer.replace(
              /\n/g,
              "<br>"
            )}</p>
            <p><small>${currentDateTime}</small></p>
          </div>
        `;
      }

      setLoading(false);
      setQuestion("");

      if (data.filename) {
        setFilename(data.filename);
        setFile(null);
        localStorage.setItem("uploadedFilename", data.filename);
      }
    } catch (error: unknown) {
      console.error("Erro ao enviar a pergunta:", error);
      toast.error((error as Error).message || "Ocorreu um erro inesperado");
      setLoading(false);
    }
  };

  // Função para limpar o localStorage e recarregar a página
  const handleNewChat = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <main>
      <ToastContainer />
      <header className="header">
        <div className="logo">
          <img src="/logo.png" alt="PDF Genius Logo" />
        </div>
        <h1>PDF Genius</h1>
        <button className="new-chat-button" onClick={handleNewChat}>
          NOVO CHAT
        </button>
      </header>
      <div
        ref={interactionsRef}
        className="interactions"
        style={{ overflowY: "auto", maxHeight: "300px" }}
      >
        {/* Conteúdo da interação será carregado aqui */}
      </div>
      <div className="content">
        {!filename && (
          <section className="upload">
            <h2>Upload de PDF</h2>
            <div className="file-upload">
              <input
                id="fileInput"
                type="file"
                accept="application/pdf"
                onChange={(e) =>
                  setFile(e.target.files ? e.target.files[0] : null)
                }
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => document.getElementById("fileInput")?.click()}
                className="upload-button"
              >
                {file ? file.name : "ANEXAR PDF"}
              </button>
            </div>
          </section>
        )}

        <section className="chat">
          <h2>Pergunte para o Genius</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Digite sua pergunta"
              disabled={loading}
            />
            <button type="submit" disabled={loading} className="icon-button">
              <svg
                width="24px"
                height="24px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="icon"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M19.2111 2.06722L3.70001 5.94499C1.63843 6.46039 1.38108 9.28612 3.31563 10.1655L8.09467 12.3378C9.07447 12.7831 10.1351 12.944 11.1658 12.8342C11.056 13.8649 11.2168 14.9255 11.6622 15.9053L13.8345 20.6843C14.7139 22.6189 17.5396 22.3615 18.055 20.3L21.9327 4.78886C22.3437 3.14517 20.8548 1.6563 19.2111 2.06722ZM8.92228 10.517C9.85936 10.943 10.9082 10.9755 11.8474 10.6424C12.2024 10.5165 12.5417 10.3383 12.8534 10.1094C12.8968 10.0775 12.9397 10.0446 12.982 10.0108L15.2708 8.17974C15.6351 7.88831 16.1117 8.36491 15.8202 8.7292L13.9892 11.018C13.9553 11.0603 13.9225 11.1032 13.8906 11.1466C13.6617 11.4583 13.4835 11.7976 13.3576 12.1526C13.0244 13.0918 13.057 14.1406 13.4829 15.0777L15.6552 19.8567C15.751 20.0673 16.0586 20.0393 16.1147 19.8149L19.9925 4.30379C20.0372 4.12485 19.8751 3.96277 19.6962 4.00751L4.18509 7.88528C3.96065 7.94138 3.93264 8.249 4.14324 8.34473L8.92228 10.517Z"
                  fill="#ffffff"
                />
              </svg>
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
