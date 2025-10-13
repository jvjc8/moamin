import React, { useEffect, useRef, useState } from "react";

/**
 * Terminal.js (updated)
 * - Projects are clickable and render an external gallery below the terminal
 * - Terminal title is fixed to "Terminal"
 * - All terminal text recolors instantly with theme
 * - Projects thumbnails are 50x50 placeholders (replaceable)
 *
 * Usage: import Terminal from './Terminal'; <Terminal />
 */

export default function Terminal() {
  // Window & UI state
  const initialWidth = 760;
  const initialHeight = 520;
  const [pos, setPos] = useState({
    left: Math.max(8, window.innerWidth / 2 - initialWidth / 2),
    top: Math.max(8, window.innerHeight / 2 - initialHeight / 2)
  });
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: initialWidth, h: initialHeight });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // Theme color definitions
  const themeDefinitions = {
    green: {
      key: "green",
      name: "Green",
      primary: "#03e65eff",
      accent: "rgba(0,255,102,0.10)",
      border: "rgba(0,255,102,0.14)",
      bg: "rgba(0,0,0,0.92)",
      promptStr: "mohammed@machine:~$",
      caret: "#00ff66",
      gameColor: "#00ff66"
    },
    red: {
      key: "red",
      name: "Red",
      primary: "#ff5f56",
      accent: "rgba(255,95,86,0.10)",
      border: "rgba(255,95,86,0.14)",
      bg: "rgba(10,10,10,0.96)",
      promptStr: "mohammed@machine:~$",
      caret: "#ff5f56",
      gameColor: "#ff5f56"
    },
    blue: {
      key: "blue",
      name: "Blue",
      primary: "#50b7ff",
      accent: "rgba(80,183,255,0.08)",
      border: "rgba(80,183,255,0.14)",
      bg: "rgba(6,10,18,0.96)",
      promptStr: "mohammed@machine:~$",
      caret: "#50b7ff",
      gameColor: "#50b7ff"
    },
    gray: {
      key: "gray",
      name: "Gray",
      primary: "#bdbdbd",
      accent: "rgba(189,189,189,0.06)",
      border: "rgba(189,189,189,0.12)",
      bg: "rgba(8,8,8,0.96)",
      promptStr: "mohammed@machine:~$",
      caret: "#bdbdbd",
      gameColor: "#bdbdbd"
    }
  };

  // load theme from localStorage or default to green
  const saved = typeof window !== "undefined" ? localStorage.getItem("terminal_color_theme") : null;
  const [themeKey, setThemeKeyRaw] = useState(saved || "green");
  const setThemeKey = (k) => {
    if (!themeDefinitions[k]) return;
    setThemeKeyRaw(k);
    try { localStorage.setItem("terminal_color_theme", k); } catch (e) {}
  };
  const theme = themeDefinitions[themeKey] || themeDefinitions.green;

  // Terminal state
  const [lines, setLines] = useState([
    "Welcome. Identity: Mohammed",
    "Signature: Fullstack Developer",
    "Type 'help' for available commands..."
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cwd] = useState("~");
  const [mode, setMode] = useState("normal"); // normal | game | ssh
  const [gameState, setGameState] = useState(null);
  const [sshState, setSshState] = useState(null);

  // refs
  const inputRef = useRef(null);
  const bodyRef = useRef(null);
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);

  // scan timers cleanup
  const scanTimersRef = useRef([]);

  // caret blink
  const [caretOn, setCaretOn] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setCaretOn((v) => !v), 520);
    return () => clearInterval(t);
  }, []);

  // auto-scroll for normal mode
  useEffect(() => {
    if (bodyRef.current && mode === "normal") bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines, mode, size]);

  // global mouse listeners for drag/resize
  useEffect(() => {
    function onMove(e) {
      if (isDragging) setPos({ left: Math.max(6, e.clientX - dragOffset.current.x), top: Math.max(6, e.clientY - dragOffset.current.y) });
      if (isResizing) {
        const nx = Math.max(360, resizeStart.current.w + (e.clientX - resizeStart.current.x));
        const ny = Math.max(240, resizeStart.current.h + (e.clientY - resizeStart.current.y));
        setSize({ width: nx, height: ny });
      }
    }
    function onUp() {
      if (isDragging) setIsDragging(false);
      if (isResizing) setIsResizing(false);
      document.body.style.userSelect = "auto";
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging, isResizing]);

  // helpers to push text lines
  const pushLine = (t) => setLines((s) => [...s, String(t)]);
  const pushLines = (arr) => setLines((s) => [...s, ...arr.map(String)]);

  // portfolio data (hardcoded, recruiter-focused). Add thumbnails (placeholder) and urls
  const portfolio = {
    about: [
      "Hi — I'm Mohammed, a Full Stack Developer who builds reliable, scalable web applications.",
      "I focus on React-driven frontends, Node.js/TypeScript backends, and pragmatic cloud deployments.",
      "I enjoy turning product ideas into polished, production-ready code."
    ],
    skills: [
      "Frontend: React, javascript,css,HTML",
      "Backend: Node.js, Express, NestJS, GraphQL, REST APIs",
      "Databases: MongoDB",
      "DevOps & Cloud: Docker, GitHub Actions, Vercel",
      "Tools: Git, Webpack, ESLint, Prettier, Jest, Cypress"
    ],
    // Projects array includes small thumbnail placeholders and links (replace later)
    projectsMeta: [
       {
        id: 1,
        short: "Moviepub — Stream movies instantly",
        details:
          "A modern movie streaming platform built with React.js and Node.js, featuring dynamic UI, secure backend APIs, and seamless hosting on Netlify.",
        thumb: "https://via.placeholder.com/50?text=1",
        href: "https://moviepub.netlify.app/"
      },
      {
        id: 2,
        short: "Eclipse Auto Sales — Buy & sell cars online",
        details:
          "An interactive car marketplace built with React.js and Node.js, offering real-time listings, smooth user experience, and fully deployed on Netlify.",
        thumb: "https://via.placeholder.com/50?text=2",
        href: "https://eclipse-auto-sales.netlify.app/"
      }
 ],
    certificates : [
  {
    name: "FullStack Development",
    url: "https://simpli-web.app.link/e/Rjy11D7apXb",
    image: "/images/fullstack.jpg",
  },
  {
    name: "AWS Generative AI",
    url: "https://simpli-web.app.link/e/GJjlpFdbpXb",
    image: "/images/aws generative ai.jpg",
  },
  {
    name: "Machine Learning Using Python",
    url: "https://simpli-web.app.link/e/fE48NYkbpXb",
    image: "/images/macine learning.jpg",
  },
  {
    name: "Build Computer Vision App",
    url: "https://coursera.org/share/3ff736a17304b3ec5936378498d97c33",
    image: "/images/micro-python.jpg",
  },
    {
    name: "generative ai",
    url: "https://coursera.org/share/3ff736a17304b3ec5936378498d97c33",
    image: "/images/igeneai.jpg",
  },
  {
    name: "Python Django 101",
    url: "https://simpli-web.app.link/e/N7NN36SapXb",
    image: "/images/pythondjango.jpg",
  },
  {
    name: "Introduction to Cyber Security",
    url: "https://simpli-web.app.link/e/V7q32IRapXb",
    image: "/images/cybersecurity.jpg",
  },
  {
    name: "Project Management 101",
    url: "https://simpli-web.app.link/e/Ho6N3yPapXb",
    image: "/images/project mana.jpg",
  },
  {
    name: "SQL for Data Analysis",
    url: "https://simpli-web.app.link/e/JBxOvNfVoXb",
    image: "/images/sql data analysis.jpg",
  },
  {
    name: "Python Programming",
    url: "https://coursera.org/share/bbf3becb03a24da276de3fa317dfa584",
    image: "/images/python.jpg",
  },
  {
    name: "Software Engineering with Knowledge Graphs and RAG",
    url: "https://simpli-web.app.link/e/kKOM2EiVoXb",
    image: "/images/software engineering certificate.jpg",
  },
  {
    name: "Software Engineering",
    image: "/images/software  eng certeficate1.jpg",
  },
],

    contact: [
      { label: "Email", value: "mohammed@example.com", href: "mailto:mohammed@example.com" },
      { label: "GitHub", value: "github.com/mohammed", href: "https://github.com/jvjc8" },
      { label: "LinkedIn", value: "linkedin.com/in/mohammed", href: "https://linkedin.com/in/mohammed" },
      { label: "Portfolio", value: "mohammed.dev", href: "https://mohammed.dev" }
    ]
  };

  // gallery visibility + selected project state
  const [projectsVisible, setProjectsVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [certificatesVisible, setCertificatesVisible] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // commands
  const commands = {
    help: [
      "Available commands:",
      "help            - show this help",
      "clear           - clear the terminal",
      "about           - show bio",
      "skills          - show technical skills",
      "projects        - list portfolio projects (click or 'open <n>')",
      "open <n>        - open project number n",
      "closeprojects   - hide the project gallery",
      "certificates    - list certifications",
      "contact         - show contact details",
      "ls              - list (fake)",
      "pwd             - print working dir",
      "theme           - show current theme and available colors",
      "theme <key>     - set theme (green|red|blue|gray)",
      "cat README.md   - show example file",
      "history         - show command history",
      "games           - list available games",
      "snake           - play Snake (arrow keys; q/Esc to quit)",
      "tictactoe       - play Tic-Tac-Toe (1-9 or click squares)",
      "ssh <host>      - fake ssh to host",
      "neofetch        - show system info (fake)",
      "ping <host>     - simulate ping",
      "banner          - ascii banner",
      "download        - download transcript",
      "copy            - copy transcript to clipboard",
      "scan <host>     - run a fake network scan (for demo)"
    ],
    banner: [
       " ███╗   ███╗ ██████╗  █████╗ ███╗   ███╗██╗███╗   ██╗",
       " ████╗ ████║██╔═══██╗██╔══██╗████╗ ████║██║████╗  ██║",
       " ██╔████╔██║██║   ██║███████║██╔████╔██║██║██╔██╗ ██║",
       " ██║╚██╔╝██║██║   ██║██╔══██║██║╚██╔╝██║██║██║╚██╗██║",
       " ██║ ╚═╝ ██║╚██████╔╝██║  ██║██║ ╚═╝ ██║██║██║ ╚████║",
       " ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝",

      "Welcome back, Mohammed."
    ],
    neofetch: [
      "Mohammed@machine",
      "OS: PortfolioOS (React)",
      "Shell: FakeShell 1.0",
      `Resolution: ${window.innerWidth}x${window.innerHeight}`,
      "Memory: 8GB simulated",
      `Theme: ${theme.name}`
    ]
  };

  // transcript utils
  const downloadTranscript = () => {
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `terminal-transcript-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    pushLine("(downloaded transcript)");
  };
  const copyTranscript = async () => {
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      pushLine("(copied transcript to clipboard)");
    } catch {
      pushLine("(copy failed)");
    }
  };

  // ---------------------------
  // Games: Snake & TicTacToe (unchanged)
  // ---------------------------
  function startSnake() {
    if (mode === "game") return;
    setMode("game");
    const grid = 16;
    const canvasW = Math.max(160, Math.floor((size.width - 36) / grid) * grid);
    const canvasH = Math.max(160, Math.floor((size.height - 160) / grid) * grid);
    const cols = Math.floor(canvasW / grid);
    const rows = Math.floor(canvasH / grid);
    const snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
    const dir = { x: 1, y: 0 };
    const food = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
    setGameState({ type: "snake", grid, cols, rows, snake, dir, food, score: 0, running: true, color: theme.gameColor });

    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    gameLoopRef.current = setInterval(() => {
      setGameState((prev) => {
        if (!prev || prev.type !== "snake" || !prev.running) return prev;
        const head = { x: prev.snake[0].x + prev.dir.x, y: prev.snake[0].y + prev.dir.y };
        // wrap
        if (head.x < 0) head.x = prev.cols - 1;
        if (head.x >= prev.cols) head.x = 0;
        if (head.y < 0) head.y = prev.rows - 1;
        if (head.y >= prev.rows) head.y = 0;
        // collision
        const collided = prev.snake.some((s) => s.x === head.x && s.y === head.y);
        if (collided) {
          clearInterval(gameLoopRef.current);
          pushLine(`(snake) Game over — score: ${prev.score}`);
          return { ...prev, running: false };
        }
        const newSnake = [head, ...prev.snake];
        let ate = false;
        if (head.x === prev.food.x && head.y === prev.food.y) ate = true;
        if (!ate) newSnake.pop();
        const newFood = ate ? { x: Math.floor(Math.random() * prev.cols), y: Math.floor(Math.random() * prev.rows) } : prev.food;
        const newScore = ate ? prev.score + 1 : prev.score;
        return { ...prev, snake: newSnake, food: newFood, score: newScore };
      });
    }, 120);
  }
  function stopSnake() {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    setGameState(null);
    setMode("normal");
    setTimeout(() => inputRef.current?.focus(), 20);
  }
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!gameState || gameState.type !== "snake") {
      ctx.clearRect(0, 0, c.width, c.height);
      return;
    }
    const { grid, cols, rows, snake, food, color } = gameState;
    c.width = cols * grid;
    c.height = rows * grid;
    ctx.clearRect(0, 0, c.width, c.height);
    // food
    ctx.fillStyle = color || theme.gameColor;
    ctx.fillRect(food.x * grid, food.y * grid, grid, grid);
    // snake
    for (let i = 0; i < snake.length; i++) {
      ctx.fillStyle = i === 0 ? "#eafff0" : (color || theme.gameColor);
      ctx.fillRect(snake[i].x * grid, snake[i].y * grid, grid - 1, grid - 1);
    }
  }, [gameState, size, themeKey]);

  function startTicTacToe() {
    if (mode === "game") return;
    setMode("game");
    setGameState({ type: "tictactoe", board: Array(9).fill(null), turn: "X", winner: null });
  }
  function makeTttMove(idx) {
    setGameState((prev) => {
      if (!prev || prev.type !== "tictactoe" || prev.winner) return prev;
      if (prev.board[idx]) return prev; // occupied
      const nb = prev.board.slice();
      nb[idx] = prev.turn;
      const nwinner = calcWinner(nb);
      const nextTurn = prev.turn === "X" ? "O" : "X";
      if (nwinner) {
        pushLine(`(tictactoe) ${nwinner} wins!`);
        return { ...prev, board: nb, winner: nwinner };
      }
      if (nb.every((c) => c !== null)) {
        pushLine(`(tictactoe) Draw!`);
        return { ...prev, board: nb, winner: "Draw" };
      }
      return { ...prev, board: nb, turn: nextTurn };
    });
  }
  function calcWinner(bd) {
    const wins = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    for (const w of wins) {
      const [a,b,c] = w;
      if (bd[a] && bd[a] === bd[b] && bd[a] === bd[c]) return bd[a];
    }
    return null;
  }
  function stopTicTacToe() {
    setGameState(null);
    setMode("normal");
    setTimeout(() => inputRef.current?.focus(), 20);
  }

  // global keyboard handling
  useEffect(() => {
    function onKey(e) {
      // game handlers
      if (mode === "game" && gameState) {
        if (gameState.type === "snake" && gameState.running) {
          if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
            e.preventDefault();
            setGameState((g) => {
              if (!g || g.type !== "snake") return g;
              const d = g.dir || { x: 1, y: 0 };
              if (e.key === "ArrowUp" && d.y !== 1) return { ...g, dir: { x:0, y:-1 } };
              if (e.key === "ArrowDown" && d.y !== -1) return { ...g, dir: { x:0, y:1 } };
              if (e.key === "ArrowLeft" && d.x !== 1) return { ...g, dir: { x:-1, y:0 } };
              if (e.key === "ArrowRight" && d.x !== -1) return { ...g, dir: { x:1, y:0 } };
              return g;
            });
          } else if (e.key === "q" || e.key === "Escape") {
            stopSnake();
            e.preventDefault();
          }
          return;
        }
        if (gameState.type === "tictactoe") {
          if (/^[1-9]$/.test(e.key)) {
            e.preventDefault();
            makeTttMove(parseInt(e.key,10) - 1);
          } else if (e.key === "q" || e.key === "Escape") {
            stopTicTacToe();
            e.preventDefault();
          }
          return;
        }
      }

      // SSH interactive handling (username/password and remote shell)
      if (mode === "ssh" && sshState) {
        if (sshState.stage === "username" || sshState.stage === "password") {
          if (e.key === "Enter") {
            e.preventDefault();
            const txt = input;
            setInput("");
            if (sshState.stage === "username") {
              setSshState((s) => ({ ...s, username: txt, stage: "password" }));
              pushLine(`login: ${txt}`);
              pushLine("password: ");
            } else {
              setSshState((s) => ({ ...s, password: txt, stage: "shell" })); 
              pushLine("(password accepted)");
              pushLine(`Welcome to ${sshState.host}. Type 'exit' to return.`);
            }
          }
          return;
        }
        if (sshState.stage === "shell") {
          if (e.key === "Enter") {
            e.preventDefault();
            const cmd = input;
            setInput("");
            const p = cmd.split(/\s+/)[0];
            if (p === "exit") {
              pushLine("logout");
              setMode("normal");
              setSshState(null);
              pushLine("(disconnected)");
            } else if (p === "ls") {
              pushLines(["bin/","etc/","home/","var/"]);
            } else if (p === "whoami") {
              pushLine(sshState.username || "user");
            } else {
              pushLine(`${p}: command not found`);
            }
          }
          return;
        }
      }

      // normal terminal behavior
      if (e.key === "Enter") {
        e.preventDefault();
        const cmd = input;
        setInput("");
        executeLine(cmd);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (history.length) {
          const idx = historyIndex < 0 ? history.length - 1 : Math.max(0, historyIndex - 1);
          setHistoryIndex(idx);
          setInput(history[idx] || "");
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (history.length) {
          const idx = historyIndex >= history.length - 1 ? -1 : Math.min(history.length - 1, historyIndex + 1);
          setHistoryIndex(idx);
          setInput(idx === -1 ? "" : history[idx] || "");
        }
      } else if (e.key === "Tab") {
        e.preventDefault();
        const candidates = [
          "help","clear","ls","pwd","cat","history","games","snake","tictactoe","ssh",
          "neofetch","ping","banner","download","copy","theme","about","skills","projects",
          "open","closeprojects","certificates","contact","scan"
        ];
        const left = input.trim();
        const match = candidates.find((c) => c.startsWith(left));
        if (match) setInput(match + (match.includes(" ") ? "" : " "));
      } else if (e.ctrlKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        setLines([]);
      } else if (e.ctrlKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        setInput("");
        pushLine("^C");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [input, history, historyIndex, mode, gameState, sshState, themeKey]);

  // helper: open project by id (1-based)
  function openProjectById(id) {
    const meta = portfolio.projectsMeta.find((p) => p.id === id);
    if (!meta) {
      pushLine(`Project ${id} not found.`);
      return;
    }
    pushLine(`Opening project ${id}: ${meta.short}`);
    setSelectedProject(meta);
    setProjectsVisible(true);
    // open link in new tab — placeholder (user will replace)
    try { window.open(meta.href, "_blank"); } catch {}
  }

  // main executor
  async function executeLine(raw) {
    const cmd = (raw || "").trim();
    if (!cmd) return;
    setHistory((h) => [...h, cmd]);
    setHistoryIndex(-1);

    // if in SSH or game, those are handled elsewhere
    if (mode === "game") {
      if (cmd === "q" || cmd === "exit") {
        if (gameState?.type === "snake") stopSnake();
        else if (gameState?.type === "tictactoe") stopTicTacToe();
        pushLine("(exited game)");
      } else {
        pushLine(`$ ${cmd}`);
        pushLine("A game is running — type 'q' or 'exit' to quit.");
      }
      return;
    }

    pushLine(`$ ${cmd}`);
    const parts = cmd.split(/\s+/);
    const base = parts[0].toLowerCase();
    const arg = parts.slice(1).join(" ");

    switch (base) {
      case "help":
        pushLines(commands.help);
        break;
      case "clear":
        setLines([]);
        break;
      case "ls":
        pushLines(["README.md","projects/"]);
        break;
      case "pwd":
        pushLine(cwd);
        break;
      case "cat":
        if (arg === "README.md") pushLines(["# Mohammed's projects","- portfolio","- chatapp",""]);
        else pushLine(`cat: ${arg || ""}: No such file`);
        break;
      case "history":
        pushLines(history.length ? history.map((h,i) => `${i+1}  ${h}`) : ["(no history)"]);
        break;
      case "games":
        pushLines(["Available games:"," - snake"," - tictactoe (or tictac)"]);
        break;
      case "snake":
      case "play":
        if (base === "play" && arg !== "snake") {
          if (arg === "tictactoe" || arg === "tictac") startTicTacToe();
          else pushLine("Usage: play snake | play tictactoe");
        } else {
          startSnake();
        }
        break;
      case "tictactoe":
      case "tictac":
        startTicTacToe();
        break;
      case "ssh":
        if (!arg) pushLine("Usage: ssh <host>");
        else {
          setMode("ssh");
          setSshState({ host: arg, stage: "connect", username: "", password: "", prompt: `${arg}:~$` });
          pushLine(`Connecting to ${arg}...`);
          setTimeout(() => {
            pushLine("Connected.");
            setSshState((s) => ({ ...s, stage: "username" }));
            pushLine("login: ");
          }, 700);
        }
        break;
      case "neofetch":
        pushLines(commands.neofetch);
        break;
      case "ping":
        if (!arg) pushLine("Usage: ping <host>");
        else {
          pushLine(`PING ${arg}`);
          for (let i=0;i<4;i++){
            pushLine(`reply from 127.0.0.1 time=${(10+Math.random()*30).toFixed(2)} ms`);
          }
          pushLine(`--- ${arg} ping statistics ---`);
        }
        break;
      case "banner":
        pushLines(commands.banner);
        break;
      case "download":
        downloadTranscript();
        break;
      case "copy":
        copyTranscript();
        break;

      // ---------- Portfolio commands ----------
      case "about":
        pushLines(portfolio.about);
        break;
      case "skills":
        pushLines(portfolio.skills);
        break;
      case "projects":
        {
          // print numbered list and open gallery
          const arr = portfolio.projectsMeta.map((p) => `${p.id}. ${p.short}`);
          pushLines(["Projects:"]);
          pushLines(arr);
          pushLine("Type 'open <n>' to open a project or click a thumbnail below.");
          setProjectsVisible(true);
          setSelectedProject(null);
        }
        break;
      case "open":
        {
          const n = parseInt(arg, 10);
          if (Number.isNaN(n)) pushLine("Usage: open <n>");
          else openProjectById(n);
        }
        break;
      case "closeprojects":
        setProjectsVisible(false);
        setSelectedProject(null);
        pushLine("(closed projects gallery)");
        break;
          case "certificates":
        pushLine("Certificates:");
        portfolio.certificates.forEach((c, i) => {
          pushLine(`${i + 1}. ${c.name} — ${c.url}`);
        });
        pushLine("Type 'closecertificates' to close or click a card.");
        setCertificatesVisible(true);
        setSelectedCertificate(null);
        break;

         case "closecertificates":
        setCertificatesVisible(false);
        setSelectedCertificate(null);
        pushLine("(closed certificates gallery)");
        break;


      case "contact":
        portfolio.contact.forEach((c) => {
          pushLine(`${c.label}: ${c.href}`);
        });
        pushLine("(click links above )");
        break;
      // fake network scan (animated)
      case "scan":
        {
          const target = arg || "example.com";
          pushLine(`Starting scan on ${target}...`);
          // clear any previous timers
          scanTimersRef.current.forEach((t) => clearTimeout(t));
          scanTimersRef.current = [];
          const simulated = [
            `Resolving ${target}... 93.184.216.34`,
            `Probing ports...`,
            `22/tcp   open   ssh`,
            `80/tcp   open   http`,
            `443/tcp  open   https`,
            `139/tcp  closed  netbios-ssn`,
            `Scan complete. 3 open ports found.`
          ];
          simulated.forEach((line, i) => {
            const t = setTimeout(() => pushLine(line), 300 * (i + 1));
            scanTimersRef.current.push(t);
          });
        }
        break;

      case "theme":
        if (!arg) {
          pushLine(`Current theme: ${theme.name} (${themeKey})`);
          pushLine("Available: " + Object.keys(themeDefinitions).join(", "));
        } else {
          const key = arg.toLowerCase();
          if (!themeDefinitions[key]) pushLine(`Unknown theme: ${arg}. Use: ${Object.keys(themeDefinitions).join(", ")}`);
          else {
            setThemeKey(key);
            pushLine(`Theme set to ${themeDefinitions[key].name}`);
          }
        }
        break;

      default:
        pushLine(`Command not found: ${cmd}`);
        pushLine("Type 'help' for available commands.");
    }
  }

  // cleanup scan timers & game loop on unmount
  useEffect(() => {
    return () => {
      scanTimersRef.current.forEach((t) => clearTimeout(t));
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, []);

  // drag / resize handlers
  function startDrag(e) {
    e.stopPropagation();
    setIsDragging(true);
    dragOffset.current = { x: e.clientX - pos.left, y: e.clientY - pos.top };
    document.body.style.userSelect = "none";
  }
  function startResize(e) {
    e.stopPropagation();
    setIsResizing(true);
    resizeStart.current = { x: e.clientX, y: e.clientY, w: size.width, h: size.height };
    document.body.style.userSelect = "none";
  }

  function handleBodyClick() {
    if (mode !== "game") inputRef.current?.focus();
    else if (gameState?.type === "snake") canvasRef.current?.focus();
  }

  // render TicTacToe board
  const renderTicBoard = () => {
    const board = (gameState && gameState.type === "tictactoe") ? gameState.board : Array(9).fill(null);
    const sizePx = Math.min(360, size.width - 120);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
        <div style={{ color: theme.primary }}>{gameState?.winner ? `Result: ${gameState.winner}` : `Turn: ${gameState?.turn}`}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, width: sizePx, maxWidth: "90%" }}>
          {board.map((cell, i) => (
            <div
              key={i}
              onClick={() => { if (gameState?.type === "tictactoe" && !gameState.winner) makeTttMove(i); }}
              style={{
                height: Math.floor(sizePx/3) - 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${theme.accent}`,
                fontSize: 28,
                color: theme.primary,
                cursor: gameState?.winner ? "default" : "pointer",
                userSelect: "none"
              }}
            >
              {cell || (i+1)}
            </div>
          ))}
        </div>
        <div style={{ color: theme.primary, opacity:0.9, fontSize: 12 }}>
          Click a square or press keys 1-9. Press Q or Esc to exit.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => { setGameState({ type: "tictactoe", board: Array(9).fill(null), turn: "X", winner: null }); }} style={smallBtnStyle(theme)}>Restart</button>
          <button onClick={() => { stopTicTacToe(); pushLine("(exited tictactoe)"); }} style={smallBtnStyle(theme)}>Exit</button>
        </div>
      </div>
    );
  };

  // small button style factory
  function smallBtnStyle(th) {
    return {
      background: "transparent",
      border: `1px solid ${th.accent}`,
      color: th.primary,
      padding: "6px 10px",
      borderRadius: 6,
      cursor: "pointer"
    };
  }

  // Projects gallery component rendered under terminal (positioned absolutely)
  const ProjectsGallery = () => {
    const left = pos.left;
    const top = pos.top + size.height + 12; // 12px gap below terminal
    const panelWidth = Math.min(size.width, 900);
    return (
      <div
        style={{
          position: "fixed",
          left,
          top,
          width: panelWidth,
          zIndex: 9998,
          background: "transparent",
          pointerEvents: "auto"
        }}
      >
        <div style={{
          display: "flex",
          gap: 12,
          padding: 12,
          borderRadius: 8,
          border: `1px solid ${theme.border}`,
          background: "rgba(0,0,0,0.72)"
        }}>
          {/* thumbnails grid */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {portfolio.projectsMeta.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => openProjectById(p.id)}
                  style={{
                    width: 50,
                    height: 50,
                    padding: 0,
                    border: `1px solid ${theme.accent}`,
                    background: "transparent",
                    display: "block",
                    cursor: "pointer"
                  }}
                  title={p.short}
                >
                  <img src={p.thumb} alt={p.short} style={{ width: 50, height: 50, display: "block", objectFit: "cover" }} />
                </button>
                <div style={{ color: theme.primary, fontSize: 13, maxWidth: 260 }}>
                  <div style={{ fontWeight: 600 }}>{p.id}. {p.short}</div>
                  <div style={{ fontSize: 11, opacity: 0.9 }}>{p.details}</div>
                </div>
              </div>
            ))}
          </div>

          {/* details panel */}
          <div style={{ marginLeft: "auto", minWidth: 220, color: theme.primary }}>
            {selectedProject ? (
              <>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{selectedProject.id}. {selectedProject.short}</div>
                <div style={{ fontSize: 13, marginBottom: 8 }}>{selectedProject.details}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <a href={selectedProject.href} target="_blank" rel="noreferrer" style={{ color: theme.primary, textDecoration: "underline" }}>Open</a>
                  <button onClick={() => { setSelectedProject(null); }} style={smallBtnStyle(theme)}>Close</button>
                </div>
              </>
            ) : (
              <div style={{ fontSize: 13, opacity: 0.95 }}>
                Click a thumbnail or use <span style={{ color: theme.primary }}>open &lt;n&gt;</span> to open a project.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Utility: render a line with clickable links (http(s) and emails)
  function renderLineWithLinks(text) {
    if (!text) return null;
    // Regex to match URLs and emails (basic)
    const urlEmailRegex = /(https?:\/\/[^\s]+|mailto:[^\s]+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = urlEmailRegex.exec(text)) !== null) {
      const idx = match.index;
      if (idx > lastIndex) {
        parts.push({ type: "text", text: text.slice(lastIndex, idx) });
      }
      const matched = match[0];
      parts.push({ type: "link", text: matched });
      lastIndex = idx + matched.length;
    }
    if (lastIndex < text.length) {
      parts.push({ type: "text", text: text.slice(lastIndex) });
    }

    return parts.map((p, i) => {
      if (p.type === "text") {
        return <span key={i}>{p.text}</span>;
      } else {
        // create proper href for email if necessary
        let href = p.text;
        if (/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(p.text) && !p.text.startsWith("mailto:")) {
          href = `mailto:${p.text}`;
        }
        // ensure clicking doesn't start dragging
        return (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => { e.stopPropagation(); }}
            style={{ color: theme.primary, textDecoration: "underline" }}
          >
            {p.text}
          </a>
        );
      }
    });
  }

  // RENDER
  return (
    <>
      <div
        onMouseDown={() => inputRef.current?.focus()}
        style={{
          position: "fixed",
          left: pos.left,
          top: pos.top,
          width: size.width,
          height: size.height,
          zIndex: 9999,
          background: theme.bg,
          border: `1px solid ${theme.border}`,
          borderRadius: 8,
          color: theme.primary,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', monospace",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
          userSelect: isDragging ? "none" : "auto",
          overflow: "hidden",
          outline: `0.1px solid green`,
          cursor: isDragging ? "grabbing" : "default"
        }}
      >
        {/* hide scrollbars visually */}
        <style>{`
          .term-body::-webkit-scrollbar { display: none; }
          .term-body { -ms-overflow-style: none; scrollbar-width: none; }
          .term-line a { color: inherit; text-decoration: underline; cursor: pointer; }
        `}</style>

        {/* Top bar (drag handle) */}
        <div
          onMouseDown={startDrag}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 10px",
            background: "black",
            cursor: "grab",
            borderBottom: `1px solid green`
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 6, background: "#ff5f56" }} />
            <div style={{ width: 12, height: 12, borderRadius: 6, background: "#ffbd2e" }} />
            <div style={{ width: 12, height: 12, borderRadius: 6, background: theme.primary }} />
          </div>

          {/* fixed name "Terminal" as requested */}
          <div style={{ color: theme.primary, fontSize: 13 }}>Terminal</div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button onMouseDown={(e) => { e.stopPropagation(); downloadTranscript(); }} style={smallBtnStyle(theme)}>⬇</button>
            <button onMouseDown={(e) => { e.stopPropagation(); copyTranscript(); }} style={smallBtnStyle(theme)}>⧉</button>
            <button onMouseDown={(e) => { e.stopPropagation(); setLines([]); }} style={smallBtnStyle(theme)}>✖</button>
          </div>
        </div>

        {/* Body */}
        <div
          ref={bodyRef}
          className="term-body"
          onClick={handleBodyClick}
          style={{
            flex: 1,
            padding: 12,
            overflowY: "auto",
            whiteSpace: "pre-wrap",
            fontSize: 13,
            lineHeight: 1.35,
            position: "relative",
            color: theme.primary // make sure all text uses theme color
          }}
        >
          {/* Game rendering */}
          {mode === "game" && gameState?.type === "snake" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ color: theme.primary }}>Snake — arrow keys to move. Q / Esc to quit.</div>
              <canvas
                ref={canvasRef}
                tabIndex={0}
                style={{
                  background: "rgba(0,0,0,0)",
                  border: `1px solid ${theme.accent}`,
                  outline: "none",
                  width: Math.min(size.width - 80, 720)
                }}
              />
              <div style={{ color: theme.primary, fontSize: 12 }}>Score: {gameState?.score ?? 0}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { stopSnake(); pushLine("(exited snake)"); }} style={smallBtnStyle(theme)}>Exit</button>
              </div>
            </div>
          )}

          {mode === "game" && gameState?.type === "tictactoe" && renderTicBoard()}

          {/* Normal terminal lines (rendered using container color so they update when theme changes) */}
          {mode === "normal" && lines.map((l, i) => {
            // if line starts with "n. " (numbered project), render as clickable span to open project
            const projectMatch = l.match(/^(\d+)\.\s+(.*)/);
            return (
              <div key={i} className="term-line" style={{ color: theme.primary }}>
                {projectMatch ? (
                  <>
                    <span style={{ marginRight: 8 }}>{projectMatch[1]}.</span>
                    <a
                      onClick={(e) => { e.stopPropagation(); openProjectById(parseInt(projectMatch[1], 10)); }}
                      style={{ color: theme.primary, textDecoration: "underline", cursor: "pointer" }}
                    >
                      {projectMatch[2]}
                    </a>
                  </>
                ) : (
                  // otherwise render text but convert URLs/emails to clickable links
                  <span>{renderLineWithLinks(l)}</span>
                )}
              </div>
            );
          })}

          {/* Prompt / Input */}
          {mode !== "game" && (
            <form
              onSubmit={(e) => { e.preventDefault(); const cmd = input; setInput(""); executeLine(cmd); }}
              style={{ display: "flex", marginTop: 8, alignItems: "center" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: theme.primary, fontSize: 13, whiteSpace: "nowrap" }}>
                <span style={{ opacity: 0.95 }}>{theme.promptStr}</span>
              </div>

              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type `help` to get available commands..."
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: theme.primary,
                  fontFamily: "monospace",
                  fontSize: 13,
                  paddingLeft: 8,
                  caretColor: theme.caret
                }}
                autoFocus
              />

              <div style={{ width: 10, height: 18, marginLeft: 8, background: caretOn ? theme.caret : "transparent", opacity: 0.9 }} />
            </form>
          )}
        </div>

        {/* Resize handle */}
        <div
          onMouseDown={startResize}
          style={{
            position: "absolute",
            right: 8,
            bottom: 8,
            width: 18,
            height: 18,
            cursor: "nwse-resize",
            background:" green",
            borderRadius: 4
          }}
        />
      </div>

      {/* Projects gallery rendered under terminal when visible */}
      {projectsVisible && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0, 0, 0, 0.35)", // lighter transparency
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      backdropFilter: "blur(2px)", // just enough blur, terminal stays visible
      pointerEvents: "auto"
    }}
    onClick={() => setProjectsVisible(false)}
  >
    <div
      style={{
        background: `${theme.bg}ee`, // slightly see-through
        border: `1px solid ${theme.border}`,
        borderRadius: 12,
        padding: 20,
        width: "80%",
        maxWidth: 900,
        maxHeight: "80vh",
        overflowY: "auto",
        boxShadow: "0 4px 30px rgba(0,0,0,0.6)",
        position: "relative",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setProjectsVisible(false)}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "transparent",
          border: "none",
          color: theme.primary,
          fontSize: 20,
          cursor: "pointer",
        }}
      >
        ✖
      </button>

      <h2 style={{ color: theme.primary, marginBottom: 16 }}>Projects</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
        }}
      >
        {portfolio.projectsMeta.map((proj) => (
          <div
            key={proj.id}
            onClick={() => window.open(proj.href, "_blank")}
            style={{
              background: theme.accent,
              border: `1px solid ${theme.border}`,
              borderRadius: 10,
              padding: 12,
              cursor: "pointer",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
          >
            <img
              src={proj.thumb}
              alt={proj.short}
              style={{
                width: "100%",
                borderRadius: 8,
                marginBottom: 8,
              }}
            />
            <div style={{ color: theme.primary, fontWeight: "bold" }}>
              {proj.short}
            </div>
            <div style={{ fontSize: 12, color: theme.primary, opacity: 0.7 }}>
              {proj.details}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}
{certificatesVisible && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0, 0, 0, 0.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      backdropFilter: "blur(2px)",
    }}
    onClick={() => {
      if (!previewImage) setCertificatesVisible(false);
    }}
  >
    <div
      style={{
        background: `${theme.bg}ee`,
        border: `1px solid ${theme.border}`,
        borderRadius: 12,
        padding: 20,
        width: "80%",
        maxWidth: 900,
        maxHeight: "80vh",
        overflowY: "auto",
        boxShadow: "0 4px 30px rgba(0,0,0,0.6)",
        position: "relative",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setCertificatesVisible(false)}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "transparent",
          border: "none",
          color: theme.primary,
          fontSize: 20,
          cursor: "pointer",
        }}
      >
        ✖
      </button>

      <h2 style={{ color: theme.primary, marginBottom: 16 }}>Certificates</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
        }}
      >
        {portfolio.certificates.map((cert, i) => (
          <div
            key={i}
            style={{
              background: theme.accent,
              border: `1px solid ${theme.border}`,
              borderRadius: 10,
              padding: 12,
              cursor: "pointer",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
          >
            <img
              src={cert.image}
              alt={cert.name}
              onClick={() => setPreviewImage(cert.image)}
              style={{
                width: "100%",
                borderRadius: 8,
                marginBottom: 8,
                cursor: "zoom-in",
              }}
            />
            <div
              style={{
                color: theme.primary,
                fontWeight: "bold",
                fontSize: 16,
                marginBottom: 4,
              }}
            >
              {cert.name}
            </div>
            <div
              style={{
                fontSize: 12,
                color: theme.primary,
                opacity: 0.7,
              }}
            >
              <a
                href={cert.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: theme.primary,
                  textDecoration: "underline",
                }}
              >
                View Certificate
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Lightbox Preview */}
    {previewImage && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
        }}
        onClick={() => setPreviewImage(null)}
      >
        <img
          src={previewImage}
          alt="Certificate Preview"
          style={{
            maxWidth: "90vw",
            maxHeight: "90vh",
            borderRadius: 8,
            boxShadow: "0 0 20px rgba(0,0,0,0.6)",
          }}
        />
        <button
          onClick={() => setPreviewImage(null)}
          style={{
            position: "absolute",
            top: 20,
            right: 30,
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: 30,
            cursor: "pointer",
          }}
        >
          ✖
        </button>
      </div>
    )}
  </div>
)}
   </>
  );
}
