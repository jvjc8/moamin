import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export default function ChatAI() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [firstOpen, setFirstOpen] = useState(true);
  const [tooltipShownOnce, setTooltipShownOnce] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let id = localStorage.getItem("chat_session_id");
    if (!id) {
      id = uuidv4();
      localStorage.setItem("chat_session_id", id);
    }
    setSessionId(id);
  }, []);

  async function sendMessage(e) {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setTypingText("");

    try {
      const res = await fetch("/api/chat", {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, sessionId }),
      });

      const data = await res.json();
      const aiText = data.reply;

      if (/i['’]ll remember|i have saved|noted|got it, i['’]ll remember/i.test(aiText)) {
        showToast("💾 Memory updated!");
      }

      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < aiText.length) {
          setTypingText((prev) => prev + aiText.charAt(i));
          i++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
          setMessages((prev) => [...prev, { role: "assistant", content: aiText }]);
          setTypingText("");
        }
      }, 20);
    } catch (err) {
      console.error("Chat error:", err);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Connection error. Try again later." },
      ]);
    }
  }

  function showToast(text) {
    setToast(text);
    setTimeout(() => setToast(null), 2500);
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    if (open && firstOpen) {
      setMessages([
        {
          role: "assistant",
          content:
            "👋 Hello! I’m Mohammed Amin’s AI Assistant. Ask me anything about his projects, skills, or certificates!",
        },
      ]);
      setFirstOpen(false);
    }
  }, [open, firstOpen]);

  useEffect(() => {
    if (!tooltipShownOnce) {
      setShowTooltip(true);
      const timer = setTimeout(() => setShowTooltip(false), 3000);
      setTooltipShownOnce(true);
      return () => clearTimeout(timer);
    }
  }, [tooltipShownOnce]);

  const resetChat = async () => {
    localStorage.removeItem("chat_session_id");
    setMessages([
      {
        role: "assistant",
        content:
          "🧠 Memory cleared. I’ve forgotten previous chats — we’re starting fresh!",
      },
    ]);
    const newId = uuidv4();
    localStorage.setItem("chat_session_id", newId);
    setSessionId(newId);
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) {
      alert("Speech not supported in this browser.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    const isArabic = /[\u0600-\u06FF]/.test(text);
    utterance.lang = isArabic ? "ar-SA" : "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      {/* 💬 Floating Button */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {showTooltip && (
          <div
            style={{
              position: "absolute",
              right: "60px",
              bottom: "10px",
              background: "rgba(0,0,0,0.85)",
              color: "#00ff99",
              padding: "8px 10px",
              borderRadius: "8px",
              fontSize: "13px",
              fontFamily: "monospace",
              border: "1px solid #00ff99",
              boxShadow: "0 0 10px #00ff99",
              whiteSpace: "nowrap",
            }}
          >
            🤖 Ask Mohammed Amin’s AI Assistant
          </div>
        )}

        <button
          onClick={() => setOpen(!open)}
          style={{
            background: open ? "#ca0446ff" : "#06b856ff",
            color: "black",
            border: "none",
            borderRadius: "50%",
            width: "50px",
            height: "50px",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "22px",
            boxShadow: "0 0 15px #00ff99",
          }}
        >
          💬
        </button>
      </div>

      {/* 🧠 Chat Panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "80px",
            right: "20px",
            width: "90vw",
            maxWidth: "360px",
            height: "70vh",
            maxHeight: "500px",
            background: "rgba(0,0,0,0.9)",
            color: "#00ff99",
            border: "1px solid #00ff99",
            borderRadius: "12px",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 0 15px #00ff99",
            zIndex: 999,
            animation: "fadeIn 0.3s ease",
          }}
        >
          {/* MESSAGES */}
          <div
            style={{
              flexGrow: 1,
              overflowY: "auto",
              padding: "6px",
              fontFamily: "monospace",
              fontSize: "14px",
              scrollbarWidth: "none",
            }}
            id="chat-messages"
          >
            <style>
              {`
                #chat-messages::-webkit-scrollbar { display: none; }
                @media (max-width: 600px) {
                  #chat-messages { font-size: 13px; }
                }
              `}
            </style>

            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  textAlign: msg.role === "user" ? "right" : "left",
                  margin: "6px 0",
                }}
              >
                <b>{msg.role === "user" ? "You" : "AI"}:</b> {msg.content}
                {msg.role === "assistant" && (
                  <button
                    onClick={() => speakText(msg.content)}
                    style={{
                      marginLeft: "6px",
                      background: "transparent",
                      border: "none",
                      color: "#00ff99",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                    title="Read aloud"
                  >
                    🔊
                  </button>
                )}
              </div>
            ))}

            {isTyping && (
              <div style={{ textAlign: "left", margin: "6px 0" }}>
                <b>AI:</b> {typingText}
                <span className="cursor">▋</span>
              </div>
            )}
          </div>

          {/* INPUT AREA */}
          <form
            onSubmit={sendMessage}
            style={{ display: "flex", flexDirection: "column", gap: "6px" }}
          >
            <div style={{ display: "flex", gap: "5px" }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question..."
                style={{
                  flexGrow: 1,
                  background: "#111",
                  border: "1px solid #00ff99",
                  color: "#00ff99",
                  borderRadius: "6px",
                  padding: "6px",
                  outline: "none",
                  fontSize: "14px",
                }}
              />
              <button
                type="submit"
                style={{
                  background: "#00ff99",
                  border: "none",
                  color: "black",
                  borderRadius: "6px",
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                Send
              </button>
            </div>

            <button
              type="button"
              onClick={resetChat}
              style={{
                marginTop: "4px",
                background: "transparent",
                border: "1px solid #ff0055",
                color: "#ff0055",
                borderRadius: "6px",
                padding: "4px",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: "monospace",
              }}
            >
              🧹 Reset Memory
            </button>
          </form>
        </div>
      )}

      {/* 🌟 Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "100px",
            right: "40px",
            background: "rgba(0, 255, 153, 0.15)",
            color: "#00ff99",
            border: "1px solid #00ff99",
            boxShadow: "0 0 20px #00ff99",
            padding: "10px 16px",
            borderRadius: "10px",
            fontFamily: "monospace",
            fontSize: "14px",
            zIndex: 2000,
            animation: "fadeInOut 2.5s ease forwards",
          }}
        >
          {toast}
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }

          @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(10px); }
            10%, 90% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(10px); }
          }

          .cursor {
            display: inline-block;
            width: 6px;
            animation: blink 1s infinite;
          }

          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }

          /* ✅ MOBILE FIXES */
          @media (max-width: 600px) {
            .chat-panel {
              width: 95vw !important;
              height: 80vh !important;
              right: 50%;
              transform: translateX(50%);
            }
          }
        `}
      </style>
    </>
  );
}
