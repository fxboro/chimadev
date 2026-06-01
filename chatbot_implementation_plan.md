# Chimadev AI Chatbot Implementation Plan

## Overview
This document outlines the architecture, logic, and features of the intelligent AI chatbot implemented for the Chimadev portfolio website. The chatbot serves as an interactive demonstration of Chima's AI capabilities while providing real-time assistance to visitors.

## 1. Core Architecture
The chatbot is a pure vanilla JavaScript implementation that integrates with the **Google Gemini 3.5 Flash API** via a secure serverless API proxy.

*   **Frontend**: Custom HTML/Tailwind CSS widget embedded in `index.html`.
*   **Logic**: Asynchronous JavaScript in `assets/js/scripts.js`.
*   **AI Model**: **Gemini 3.5 Flash** (Adopted May 2026). This generation offers superior reasoning, native multimodal support, and drastically reduced latency for agentic workflows.
*   **Backend Proxy**: A serverless function at `/api/chat` which forwards requests securely to Google's API, keeping the API key hidden.
*   **Persistence**: `localStorage` is used to maintain chat history across page refreshes.

## 2. Key Features

### A. Context-Aware Intelligence
The bot uses a comprehensive **System Prompt** that feeds it all relevant information about Chimadev:
- **Services**: Web Design, App Development, AI Automation, Workflow Optimization.
- **Process**: Audit, Architecture, Build, Launch.
- **Audience**: Small businesses, entrepreneurs, influencers.
- **Contact**: Primary lead to `hallo@chimadev.com`.

### B. Dynamic Persona Switching
A unique feature allows users to change the bot's "personality" via a dropdown menu, affecting its tone and specific responses:
- **Fun**: Friendly, energetic, and humorous.
- **Professional**: Concise, polite, and business-focused.
- **Sarcastic**: Witty, slightly condescending (tired genius vibe), yet helpful.

### C. Voice Integration
Includes a **Web Speech API** implementation allowing users to dictate messages using their microphone, enhancing accessibility and interactivity.

### D. Audio/Visual Feedback
- **Typing Indicators**: Visual bouncing dots and a recurring typing sound effect simulate real-time processing.
- **Auto-Scroll**: The chat window automatically stays at the bottom to show the latest messages.

## 3. Implementation Details

### API Integration
The frontend client sends chat history and tone parameters to the backend serverless proxy `/api/chat`, which forwards requests to the Gemini 3.5 Flash API:
```javascript
const response = await fetch(`/api/chat`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT + "\n\n" + toneInstruction }]
    },
    contents: chatSessionHistory
  })
});
```

The backend proxy (`api/chat.js`) handles the request securely:
```javascript
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(req.body)
});
```

### Safety & Guardrails
- **Prompt Constraints**: Instructed to keep answers short (1-3 sentences) and never invent information.
- **Error Handling**: Graceful fallback to a support email message if the API call fails.

## 4. Maintenance & Security
> [!NOTE]
> The API calls are proxy-routed through `api/chat.js` to ensure the `GEMINI_API_KEY` environment variable is fully protected from client exposure.

## 5. Future Roadmap
- **Function Calling**: Implement tools to let the bot query the ROI calculator or check calendar availability.
- **RAG Integration**: Index deeper case studies or blog posts for more detailed technical answers.
