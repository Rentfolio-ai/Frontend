# Vasthu AI — Frontend

> **React + TypeScript web application for AI-powered real estate investment analysis.**

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

---

## Overview

The Vasthu AI Frontend is a modern web application that provides a conversational AI interface for real estate investment analysis. It connects to the [Vasthu Agentic Layer](https://github.com/Rentfolio-ai/civitas) for AI chat and to the [DataLayer](https://github.com/Rentfolio-ai/datalayer) for data operations.

### Key Features

- **AI Chat Interface** — Streaming responses with thinking indicators and tool execution visibility
- **Financial Analysis** — P&L calculator, ROI/Cap Rate modeling, cash flow projections
- **Property Discovery** — Natural language search with deal scoring
- **Report Generation** — AI-driven investment memos
- **Modern UI** — Glassmorphic design, responsive layout, command palette (`Cmd+K`)

---

## Quick Start

### Prerequisites

- Node.js 18+
- Backend services running:
  - [DataLayer](https://github.com/Rentfolio-ai/datalayer) on port 8001
  - [Vasthu Agentic Layer](https://github.com/Rentfolio-ai/civitas) on port 8000

### Setup

```bash
# Clone & install
git clone https://github.com/Rentfolio-ai/frontend.git
cd frontend/civitas-ai
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Firebase config

# Start dev server
npm run dev
```

The app runs on `http://localhost:5173`. The Vite config proxies `/api` requests to the backend.

---

## Tech Stack

- **React 19** + **TypeScript 5** + **Vite**
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **Zustand** for state management
- **Firebase Auth** for authentication
- **SSE** for real-time AI streaming

---

## Architecture

```
src/
├── components/        # React components
│   ├── chat/          # Chat interface, message bubbles, thinking indicators
│   ├── analysis/      # P&L, deal analyzer, calculators
│   ├── hunter/        # Property search & filtering
│   ├── portfolio/     # Portfolio management
│   ├── desktop-shell/ # App layout, sidebar, navigation
│   └── ui/            # Reusable primitives (buttons, inputs, cards)
├── hooks/             # Custom React hooks (useStreamChat, etc.)
├── services/          # API clients (chat SSE, REST)
├── stores/            # Zustand stores (analysis, preferences)
├── types/             # TypeScript definitions
├── utils/             # Helper functions
└── pages/             # Route-level page components
```

### Data Flow

1. User sends a message or triggers a tool
2. Frontend streams SSE from `/v2/chat/stream`
3. AI responses render in real-time with thinking indicators
4. Tool results (properties, charts, reports) render as interactive cards

---

## Configuration

See `.env.example` for all variables. Key ones:

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase Auth API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_API_KEY` | Backend service key |

> **Note**: `VITE_FIREBASE_*` values are public client-side config, not secrets. The `VITE_API_KEY` should be kept private.

---

## Related Repositories

- **[Vasthu DataLayer](https://github.com/Rentfolio-ai/datalayer)** — Data pipeline, financial engine, RAG
- **[Vasthu Agentic Layer](https://github.com/Rentfolio-ai/civitas)** — LLM orchestration, chat, tool execution

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

## License

MIT — see [LICENSE](LICENSE) for details.
