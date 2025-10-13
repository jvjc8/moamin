import React, { useState } from "react";
import MatrixBackground from "./components/MatrixBackground.js";
import Terminal from "./components/Terminal.js";
import ChatAI from "./components/ChatAI.js";

export default function App() {
  const [theme, setTheme] = useState("hacker");

  const projects = [
    { id: "p1", title: "Realtime Chat", desc: "Socket.io realtime chat", link: "#" },
    { id: "p2", title: "Inventory Dashboard", desc: "RBAC + charts", link: "#" },
    { id: "p3", title: "3D Portfolio", desc: "Three.js hero", link: "#" },
  ];

  return (
    <div className={`app-root ${theme}`}>
      <MatrixBackground />
      <div className="center-wrap">
        <Terminal projects={projects} setTheme={setTheme} />
      </div>

      {/* AI Chat Floating Widget */}
      <ChatAI />
    </div>
  );
}
