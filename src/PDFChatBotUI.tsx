import React, { useState } from "react";
import { Send } from "lucide-react";

interface Message {
  type: "user" | "bot";
  text: string;
}

const PDFChatBotUI = () => {
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setPdfFiles((prev) => [...prev, ...filesArray]);
      setIsUploading(true);
      const formData = new FormData();
      filesArray.forEach((file) => formData.append("pdfs", file));

      try {
        const response = await fetch("https://pdfchatbotui.onrender.com/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log("Files uploaded successfully");
      } catch (error) {
        console.error("Error uploading files:", error);
        setMessages((prev) => [
          ...prev,
          { type: "bot", text: "Failed to upload files." },
        ]);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    const currentQuestion = question;
    setMessages((prev) => [...prev, { type: "user", text: currentQuestion }]);
    setQuestion("");

    try {
      const response = await fetch("https://pdfchatbotui.onrender.com/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: currentQuestion }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: data.answer || "No answer received." },
      ]);
    } catch (error) {
      console.error("Error asking question:", error);
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "Failed to get an answer." },
      ]);
    }
  };

  const cn = (...classes: string[]): string => {
    return classes.filter(Boolean).join(" ");
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row font-sans">
      {/* Left: Upload */}
      <div className="md:w-1/3 w-full p-4 border-b md:border-b-0 md:border-r bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Upload PDFs</h2>
        <input
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFileUpload}
          className="mb-4 w-full"
          name="pdf"
        />
        {isUploading && (
          <p className="text-sm text-gray-500">Uploading...</p>
        )}
        <ul className="text-sm">
          {pdfFiles.map((file, index) => (
            <li key={index} className="truncate">
              • {file.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Right: Chatbot */}
      <div className="md:w-2/3 w-full p-4 flex flex-col flex-grow">
        <h2 className="text-xl font-semibold mb-4">Ask Questions</h2>

        <div className="flex-1 overflow-y-auto bg-white border rounded p-4 space-y-3">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={cn(
                "p-2 rounded-lg max-w-md",
                msg.type === "user"
                  ? "bg-blue-100 self-end ml-auto"
                  : "bg-green-100 self-start mr-auto",
                "whitespace-pre-wrap"
              )}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <textarea
            rows={2}
            className="flex-1 p-2 border rounded resize-none"
            placeholder="Type your question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAskQuestion();
              }
            }}
          />
          <button
            onClick={handleAskQuestion}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center"
          >
            <Send className="w-4 h-4 mr-1" />
            Ask
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFChatBotUI;
