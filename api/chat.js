import OpenAI from "openai";

// 🧠 Mohammed Amin’s Personal Data
const MOHAMMED_AMIN_DATA = {
  about: [
    "Hi — I'm Mohammedamin, a Full Stack Developer who builds reliable, scalable web applications.",
    "I focus on React-driven frontends, Node.js/TypeScript backends, and pragmatic cloud deployments.",
    "I enjoy turning product ideas into polished, production-ready code."
  ],
  skills: [
    "Frontend: React, JavaScript, CSS, HTML",
    "Backend: Node.js, Express, NestJS, GraphQL, REST APIs",
    "Databases: MongoDB",
    "DevOps & Cloud: Docker, GitHub Actions, Vercel",
    "Tools: Git, Webpack, ESLint, Prettier, Jest, Cypress"
  ],
  projectsMeta: [
    {
      id: 1,
      short: "Moviepub — Stream movies instantly",
      details:
        "A modern movie streaming platform built with React.js and Node.js, featuring dynamic UI, secure backend APIs, and seamless hosting on Netlify."
    },
    {
      id: 2,
      short: "Eclipse Auto Sales — Buy & sell cars online",
      details:
        "An interactive car marketplace built with React.js and Node.js, offering real-time listings, smooth user experience, and fully deployed on Netlify."
    }
  ],
  certificates: [
    {
      name: "FullStack Development",
      url: "https://simpli-web.app.link/e/Rjy11D7apXb",
      image: "/images/fullstack.jpg"
    },
    {
      name: "AWS Generative AI",
      url: "https://simpli-web.app.link/e/GJjlpFdbpXb",
      image: "/images/aws generative ai.jpg"
    },
    {
      name: "Machine Learning Using Python",
      url: "https://simpli-web.app.link/e/fE48NYkbpXb",
      image: "/images/macine learning.jpg"
    },
    {
      name: "Build Computer Vision App",
      url: "https://coursera.org/share/3ff736a17304b3ec5936378498d97c33",
      image: "/images/micro-python.jpg"
    },
    {
      name: "Generative AI",
      url: "https://coursera.org/share/3ff736a17304b3ec5936378498d97c33",
      image: "/images/igeneai.jpg"
    },
    {
      name: "Python Django 101",
      url: "https://simpli-web.app.link/e/N7NN36SapXb",
      image: "/images/pythondjango.jpg"
    },
    {
      name: "Introduction to Cyber Security",
      url: "https://simpli-web.app.link/e/V7q32IRapXb",
      image: "/images/cybersecurity.jpg"
    },
    {
      name: "Project Management 101",
      url: "https://simpli-web.app.link/e/Ho6N3yPapXb",
      image: "/images/project mana.jpg"
    },
    {
      name: "SQL for Data Analysis",
      url: "https://simpli-web.app.link/e/JBxOvNfVoXb",
      image: "/images/sql data analysis.jpg"
    },
    {
      name: "Python Programming",
      url: "https://coursera.org/share/bbf3becb03a24da276de3fa317dfa584",
      image: "/images/python.jpg"
    },
    {
      name: "Software Engineering with Knowledge Graphs and RAG",
      url: "https://simpli-web.app.link/e/kKOM2EiVoXb",
      image: "/images/software engineering certificate.jpg"
    },
    {
      name: "Software Engineering",
      image: "/images/software  eng certeficate1.jpg"
    }
  ],
  contact: [
    {
      label: "Email",
      value: "mohammed@example.com",
      href: "mailto:mohammed@example.com"
    },
    {
      label: "GitHub",
      value: "github.com/mohammed",
      href: "https://github.com/jvjc8"
    },
    {
      label: "LinkedIn",
      value: "linkedin.com/in/mohammed",
      href: "https://linkedin.com/in/mohammed"
    },
    {
      label: "Portfolio",
      value: "mohammed.dev",
      href: "https://mohammed.dev"
    }
  ]
};

// 🧠 Temporary in-memory sessions (serverless-safe)
let sessions = {};

function getSession(sessionId) {
  if (!sessions[sessionId]) {
    sessions[sessionId] = {
      name: null,
      interests: [],
      history: []
    };
  }
  return sessions[sessionId];
}

// ✅ Vercel API handler
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { message, sessionId } = req.body;
    if (!message || !sessionId) {
      return res.status(400).json({ error: "Missing message or sessionId" });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const session = getSession(sessionId);
    const userHistory = session.history.slice(-10);
    let memoryUpdated = false;

    const systemPrompt = `
You are **Mohammed Amin’s AI Assistant**, living inside his portfolio website.

You know everything about him — his background, projects, certificates, and contact details.

Here is verified information about him:
${JSON.stringify(MOHAMMED_AMIN_DATA, null, 2)}

Your role:
- Greet users politely and naturally.
- Talk confidently about Mohammed Amin’s skills, projects, and certificates.
- If a user asks for project links or contact info, use the data above.
- You can mention his GitHub and LinkedIn.
- Remember facts users share (like their name or interests) for the current session.
- Never call yourself ChatGPT — you are Mohammed Amin’s AI assistant.
- Always speak naturally and conversationally.
`;

    const messages = [
      { role: "system", content: systemPrompt },
      {
        role: "system",
        content: `User memory: ${JSON.stringify({
          name: session.name,
          interests: session.interests
        })}`
      },
      ...userHistory,
      { role: "user", content: message }
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages
    });

    const reply = completion.choices[0].message.content;

    // 🧠 Save conversation
    session.history.push({ role: "user", content: message });
    session.history.push({ role: "assistant", content: reply });

    // Detect name
    const nameMatch = message.match(/my name is\s+([A-Za-z]+)/i);
    if (nameMatch) {
      const newName = nameMatch[1];
      if (session.name !== newName) {
        session.name = newName;
        memoryUpdated = true;
      }
    }

    // Detect interests
    const interestMatch = message.match(
      /(interested in|learning|love|like)\s+([A-Za-z]+)/i
    );
    if (interestMatch) {
      const interest = interestMatch[2].toLowerCase();
      if (!session.interests.includes(interest)) {
        session.interests.push(interest);
        memoryUpdated = true;
      }
    }

    res.status(200).json({ reply, memoryUpdated });
  } catch (error) {
    console.error("❌ API error:", error);
    res.status(500).json({ error: error.message });
  }
}
