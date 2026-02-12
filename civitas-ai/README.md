# Civitas AI Frontend

> **AI-Powered Real Estate Investment Platform**
> An intelligent assistant for real estate investors, leveraging advanced AI agent swarms to provide comprehensive property analysis, market insights, and investment recommendations.

---

## 📋 Table of Contents

- [Overview](#overview)
- [✨ Key Features](#-key-features)
- [🛠  Tech Stack](#-tech-stack)
- [🏗  Architecture](#-architecture)
- [📁 Project Structure](#-project-structure)
- [🧩 Key Modules](#-key-modules)
- [🚀 Getting Started](#-getting-started)
- [🔌 Backend Integration](#-backend-integration)
- [🤝 Contributing](#-contributing)

---

## Overview

**Civitas AI** is a cutting-edge web application producing a "Bloomberg Terminal for Real Estate" experience. It combines a conversational AI interface with rich, interactive data visualizations. Built with **React 19** and **TypeScript**, it features a responsive, glassmorphic UI powered by **TailwindCSS** and **Framer Motion**.

The platform is designed to handle complex real estate workflows:
1.  **Discovery**: "Hunter Mode" for finding off-market and on-market deals.
2.  **Analysis**: Deep P&L calculations, renovation estimates, and cash flow modeling.
3.  **Execution**: Generating offers, reports, and compliance checks.

---

## ✨ Key Features

### 🧠 **Advanced AI Chat Interface**
- **Multi-Agent Orchestration**: Interaction with specialized agents (Researcher, Hunter, Strategist).
- **Thinking Indicators**: Real-time transparency into the AI's reasoning process and tool usage.
- **Deep Reasoning Traces**: Collapsible "System 2" reasoning steps for complex analysis.
- **Rich Message Bubbles**: Interactive cards for properties, charts, and reports embedded directly in the chat.
- **Citations & Sources**: Inline citations linking to data sources (web, documents, database).

### 🔍 **Hunter Mode (Property Discovery)**
- **Smart Search**: Natural language queries converted into precise filters.
- **Interactive Maps**: (Future/Planned) Visualizing opportunities.
- **Deal Scoring**: Automated evaluation of properties against investment criteria.

### 📊 **Financial Engine**
- **Deal Analyzer**: Instant ROI, Cap Rate, and Cash-on-Cash calculations.
- **P&L Calculator**: Detailed monthly and yearly cash flow projections.
- **Renovation Estimator**: AI-driven cost estimates based on property condition.

### 🏛 **Compliance & Due Diligence**
- **Zoning Checks**: Automated verification of STR/LTR regulations.
- **Reports**: Generation of PDF investment memos and comparison reports.

### 🎨 **Modern UX/UI**
- **Glassmorphism Design**: Premium aesthetic with blurred backgrounds and subtle gradients.
- **Adaptive Layouts**: Seamless experience across Desktop, Tablet, and Mobile.
- **Command Palette**: Quick navigation and action execution (`Cmd+K`).

---

## 🛠 Tech Stack

### Core Framework
- **React 19**: Utilizing the latest concurrent features and hooks.
- **TypeScript 5**: Strict type safety for robust development.
- **Vite 7**: Ultra-fast build tool and dev server.

### Styling & Animation
- **TailwindCSS 3.4**: Utility-first styling with a custom design system.
- **Framer Motion 12**: Complex layout transitions and micro-interactions.
- **Lucide React**: Consistent and lightweight icon system.

### State Management
- **Zustand**: Minimalist store for global state (User, Preferences, Analysis).
- **React Context**: For auth and theme providers.

### Data & Connectivity
- **Firebase**: Authentication and secure user management.
- **Apollo Client (GraphQL)**: Efficient data fetching (where applicable).
- **Server-Sent Events (SSE)**: Real-time streaming for AI responses.

---

## 🏗 Architecture

The application follows a **Component-Based Architecture** with a focus on separation of concerns:

- **Presentation Layer**: Pure UI components in `src/components/ui` and feature-specific directories.
- **Logic Layer**: Custom hooks in `src/hooks` encapsulate complex business logic and state interactions.
- **Service Layer**: `src/services` handles API communication, ensuring UI components remain agnostic of network implementation.
- **State Layer**: Zustand stores in `src/stores` manage cross-component state (e.g., active deal analysis, user bookmarks).

### Data Flow Pattern
1.  **User Action**: User types a message or clicks a tool.
2.  **Service Call**: `ChatService` or `AgentsApi` sends data to the backend.
3.  **Stream Handling**: The frontend consumes SSE streams, updating the `MessageList` in real-time.
4.  **State Update**: Stores update to reflect new properties found, analysis results, or UI states.

---

## 📁 Project Structure

A comprehensive breakdown of the `src` directory:

```
src/
├── components/          # React Components
│   ├── analysis/        # P&L, Deal Analyzer, Calculators
│   ├── auth/            # Sign In/Up forms, Protected Routes
│   ├── chat/            # Chat interface, Message Bubbles, Input
│   │   ├── MessageList.tsx      # Main chat history renderer
│   │   ├── MessageBubble.tsx    # Individual message component
│   │   └── ThinkingIndicator.tsx # AI processing status
│   ├── common/          # Shared business components (Avatar, Badges)
│   ├── desktop-shell/   # Main app layout, Sidebar, Navigation
│   ├── hunter/          # Property finding & filtering components
│   ├── modals/          # Global modals (Settings, Pricing)
│   ├── portfolio/       # Portfolio management views
│   ├── property/        # Property cards, details, and lists
│   ├── ui/              # Reusable primitives (Buttons, Inputs, Cards)
│   └── vision/          # Computer Vision / Image upload components
│
├── hooks/               # Custom React Hooks
│   ├── useStreamChat.ts # Core chat streaming logic
│   └── useDesktopShell.ts # Layout state management
│
├── services/            # API Services
│   ├── chatService.ts   # SSE implementation
│   └── api.ts           # Axios/Fetch instances
│
├── stores/              # Zustand Stores
│   ├── analysisStore.ts # Financial analysis state
│   └── preferencesStore.ts # User settings
│
├── types/               # TypeScript Definitions
├── utils/               # Helper functions
└── pages/               # Top-level Page components
```

---

## 🧩 Key Modules

### 1. Chat System (`src/components/chat`)
The heart of the application. It handles:
- **Streaming**: Renders tokens as they arrive.
- **Tool Rendering**: Dynmically imports and renders cards based on tool outputs (e.g., `ScoutProperties` results).
- **Branching**: Supports experimental conversation branching (navigating through message versions).

### 2. Hunter Mode (`src/components/hunter`)
A specialized interface for power users to search and filter properties. It connects directly to the `ScoutProperties` agent tool.

### 3. Desktop Shell (`src/components/desktop-shell`)
The layout wrapper that manages the sidebar, header, and main content area. It handles responsive collapsing and theme switching.

---

## 🚀 Getting Started

### Prerequisites
- Node.js > 18
- NPM or Yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repo-url>
    cd civitas-ai
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file based on `.env.example`:
    ```env
    VITE_FIREBASE_API_KEY=...
    VITE_BACKEND_URL=http://localhost:8000
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

---

## 🔌 Backend Integration

The frontend expects a backend capable of **Server-Sent Events (SSE)** for the chat interface.

- **Endpoint**: `POST /api/stream`
- **Protocol**: SSE
- **Events**:
    - `thinking`: AI is processing (updates the `ThinkingIndicator`).
    - `tool_start` / `tool_end`: AI is using a tool (renders tool status).
    - `content`: Text response chunks.
    - `done`: Stream complete.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:
1.  Create a feature branch (`git checkout -b feature/amazing-feature`).
2.  Commit your changes following conventional commits.
3.  Push to the branch.
4.  Open a Pull Request.

---
**Built with ❤️ for Real Estate Innovators.**
