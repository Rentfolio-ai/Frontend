# Civitas AI

> **AI-Powered Real Estate Investment Platform**  
> An intelligent assistant for real estate investors, leveraging cutting-edge AI to provide comprehensive property analysis, market insights, and investment recommendations.

---

## 📋 Table of Contents

- [Overview](#overview)
- [✨ Key Features](#-key-features)
- [🛠 Tech Stack](#-tech-stack)
- [🏗 Architecture](#-architecture)
- [🚀 Getting Started](#-getting-started)
- [💻 Development](#-development)
- [📁 Project Structure](#-project-structure)
- [🔌 Backend Integration](#-backend-integration)
- [🧪 Testing](#-testing)
- [📦 Deployment](#-deployment)
- [📚 Documentation](#-documentation)
- [🤝 Contributing](#-contributing)

---

## Overview

**Civitas AI** is a modern web application that transforms real estate investment research through artificial intelligence. Built with React and TypeScript, it provides investors with a conversational interface to analyze properties, evaluate markets, run financial calculations, and make data-driven investment decisions.

### What Makes Civitas AI Unique?

- **🤖 AI-First Interface**: Natural language interaction with advanced LLM-powered insights
- **📊 Real-Time Data Streaming**: Live thinking states and progressive analysis
- **🏠 Holographic Visualization**: 3D property views generated procedurally from metadata
- **💼 Portfolio Management**: Track and analyze your entire real estate portfolio
- **📈 Advanced Analytics**: P&L calculations, cash flow projections, and market analysis
- **🔐 Firebase Authentication**: Secure user management with Google OAuth support
- **📱 Responsive Design**: Beautiful UI that works on desktop, tablet, and mobile

---

## ✨ Key Features

### 🔍 **Property Search & Discovery**
- Natural language property queries
- Advanced filtering by location, price, property type, and more
- RentCast API integration for real-time listings
- Saved searches and bookmarks with notes and tags
- Property comparison (up to 3 properties side-by-side)
- PDF export for comparison reports

### 💰 **Financial Analysis**
- **P&L Calculator**: Comprehensive profit & loss projections
- **Deal Analyzer**: Investment return calculations (ROI, Cap Rate, Cash-on-Cash)
- **Cash Flow Modeling**: Monthly and yearly cash flow projections
- **Mortgage Calculator**: Payment schedules and amortization
- **Renovation Cost Estimation**: AI-powered cost analysis from images

### 📊 **Market Intelligence**
- Real-time market statistics (median prices, rents, growth trends)
- Neighborhood insights and demographics
- Rental rate analysis
- Market trend visualizations
- Investment opportunity scoring

### 🏛 **Compliance & Regulations**
- Zoning regulation checks
- STR (Short-Term Rental) legality verification
- ADU (Accessory Dwelling Unit) feasibility analysis
- Building code compliance
- Policy hierarchy resolution (federal, state, county, city)

### 💼 **Portfolio Management**
- Multi-property portfolio tracking
- Performance analytics and metrics
- Cash flow history and projections
- Portfolio optimization suggestions
- Export reports and statements

### 🖼️ **AI Vision Analysis**
- Property image analysis
- Renovation cost estimation from photos
- Architectural feature detection
- Property condition assessment

### 🎨 **Advanced UI/UX**
- **Holographic Property View**: 3D floor plan visualization
- **Thinking Indicators**: Real-time AI processing states
- **Framer Motion Animations**: Smooth, premium interactions
- **Dark Mode**: Sophisticated warm slate color palette
- **Glassmorphism**: Modern, layered UI design
- **Command Palette**: Quick actions and shortcuts

---

## 🛠 Tech Stack

### Frontend Core
- **React 19.1.1** - Modern UI library with latest features
- **TypeScript 5.8.3** - Type-safe development
- **Vite 7.1.2** - Lightning-fast build tool
- **TailwindCSS 3.4.17** - Utility-first CSS framework

### State Management
- **Zustand 5.0.9** - Lightweight state management
- **LocalStorage** - Client-side persistence

### Animation & UI
- **Framer Motion 12.23.24** - Advanced animations
- **Lucide React 0.544.0** - Beautiful icon library
- **Class Variance Authority** - Component variant management
- **Tailwind Merge** - Dynamic class composition

### Utilities
- **React Markdown 10.1.0** - Markdown rendering with GFM support
- **React Syntax Highlighter 16.1.0** - Code syntax highlighting
- **date-fns 4.1.0** - Date manipulation
- **Fuse.js 7.1.0** - Fuzzy search
- **jsPDF 3.0.4** - PDF generation

### Authentication & Backend
- **Firebase 12.6.0** - Authentication and user management
- **Custom REST APIs** - Backend integration
- **Server-Sent Events (SSE)** - Real-time streaming

### Development Tools
- **ESLint 9.33.0** - Code linting
- **TypeScript ESLint 8.39.1** - TypeScript linting
- **PostCSS & Autoprefixer** - CSS processing

---

## 🏗 Architecture

### Component Structure

```
civitas-ai/
├── src/
│   ├── components/
│   │   ├── auth/              # Authentication components
│   │   ├── chat/              # Chat interface & message bubbles
│   │   ├── property/          # Property cards & visualization
│   │   ├── comparison/        # Property comparison UI
│   │   ├── analysis/          # Deal analyzer & P&L calculator
│   │   ├── portfolio/         # Portfolio management
│   │   ├── compliance/        # Compliance drawer & reports
│   │   ├── market/            # Market statistics display
│   │   ├── onboarding/        # User onboarding flow
│   │   ├── desktop-shell/     # Main shell, sidebar, navigation
│   │   ├── modals/            # Modals (FAQ, pricing, settings)
│   │   └── ui/                # Reusable UI primitives
│   │
│   ├── stores/                # Zustand state stores
│   │   ├── analysisStore.ts
│   │   ├── bookmarksStore.ts
│   │   ├── comparisonStore.ts
│   │   ├── portfolioStore.ts
│   │   └── preferencesStore.ts
│   │
│   ├── services/              # API integrations
│   │   ├── ChatService.ts     # SSE streaming
│   │   ├── agentsApi.ts       # Agent tools integration
│   │   ├── authApi.ts         # Authentication
│   │   ├── portfolioApi.ts
│   │   ├── marketApi.ts
│   │   └── visionApi.ts
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── useStreamChat.ts
│   │   ├── useChatHistory.ts
│   │   └── usePropertySearch.ts
│   │
│   ├── types/                 # TypeScript type definitions
│   │   ├── index.ts
│   │   ├── backendTools.ts
│   │   ├── compliance.ts
│   │   ├── market.ts
│   │   ├── portfolio.ts
│   │   └── stream.ts
│   │
│   ├── utils/                 # Utility functions
│   │   ├── pdfExport.ts
│   │   ├── formatters.ts
│   │   └── validation.ts
│   │
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx
│   │
│   ├── layouts/               # Layout components
│   │   └── DesktopShell.tsx
│   │
│   └── pages/                 # Page components
│       ├── ChatPage.tsx
│       └── PnLCalculatorPage.tsx
```

### Data Flow

```
User Input → Chat Interface → SSE Stream API → Backend LLM
                                    ↓
                            Tool Execution
                                    ↓
                        Real-time UI Updates
                                    ↓
                            Streamed Response
```

### State Management Pattern

- **Zustand Stores**: Modular, lightweight state management
- **LocalStorage Sync**: Auto-persistence for bookmarks, preferences, chat history
- **React Context**: Authentication state and user data
- **Component State**: UI-specific state (modals, toggles)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Firebase Account** (for authentication)
- **Backend API** (see [Backend Integration](#-backend-integration))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd civitas-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the project root:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

### Backend Setup

The frontend requires a backend API. See [`docs/BACKEND_REQUIREMENTS_SUMMARY.md`](docs/BACKEND_REQUIREMENTS_SUMMARY.md) for complete backend implementation requirements.

**Required endpoints:**
- `POST /api/stream` - SSE streaming for chat (see [`docs/BACKEND_STREAM_IMPLEMENTATION.md`](docs/BACKEND_STREAM_IMPLEMENTATION.md))
- `POST /api/auth/signin` - User authentication
- `POST /api/auth/signup` - User registration
- `GET /api/auth/me` - Get current user

The Vite dev server proxies `/api/*` requests to `http://127.0.0.1:8000` by default (configurable in `vite.config.ts`).

---

## 💻 Development

### Development Workflow

```bash
# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Code Style

- **TypeScript** strict mode enabled
- **ESLint** for code quality
- **Prettier** compatible (recommended)
- **Component naming**: PascalCase for components, camelCase for functions/variables
- **File structure**: One component per file, co-located with styles

### Key Development Files

- **`vite.config.ts`** - Vite configuration with API proxy
- **`tailwind.config.js`** - TailwindCSS theme customization
- **`tsconfig.json`** - TypeScript configuration
- **`eslint.config.js`** - ESLint rules

### Environment Variables

All environment variables must be prefixed with `VITE_`:

```typescript
// Access in code
import.meta.env.VITE_FIREBASE_API_KEY
```

### Adding New Features

1. Create feature branch: `git checkout -b feature/your-feature`
2. Implement components in appropriate directory
3. Add TypeScript types to `src/types/`
4. Update stores if needed
5. Test thoroughly
6. Submit PR with documentation

---

## 📁 Project Structure

```
civitas-ai/
├── docs/                              # Documentation
│   ├── BACKEND_REQUIREMENTS_SUMMARY.md
│   ├── BACKEND_STREAM_IMPLEMENTATION.md
│   ├── BACKEND_AUTH_API.md
│   ├── BACKEND_ONBOARDING_API.md
│   └── PROPERTY_MANAGEMENT.md
│
├── public/                            # Static assets
│
├── src/                               # Source code
│   ├── components/                    # React components
│   ├── services/                      # API services
│   ├── stores/                        # State management
│   ├── hooks/                         # Custom hooks
│   ├── types/                         # TypeScript types
│   ├── utils/                         # Utility functions
│   ├── styles/                        # Global styles
│   ├── App.tsx                        # Root component
│   ├── main.tsx                       # Entry point
│   └── index.css                      # Global CSS
│
├── FEATURE_IMPLEMENTATION.md          # Feature status
├── HOLOGRAPHIC_INTEGRATION.md         # 3D view documentation
├── SESSION_SUMMARY.md                 # Development session notes
├── backend_schema.md                  # Backend event schema
├── package.json                       # Dependencies
├── vite.config.ts                     # Vite configuration
├── tailwind.config.js                 # Tailwind configuration
├── tsconfig.json                      # TypeScript configuration
└── README.md                          # This file
```

---

## 🔌 Backend Integration

### API Endpoints

Civitas AI requires a backend API that implements the following endpoints:

#### Authentication
- `POST /api/auth/signin` - Email/password sign-in
- `POST /api/auth/signup` - Create new account
- `GET /api/auth/me` - Get current user
- `POST /api/auth/signout` - Sign out user

#### Chat & Streaming
- `POST /api/stream` - SSE streaming endpoint (primary)
- `POST /api/chat` - Fallback chat endpoint

#### Property Search
- Handled via AI agent tools in streaming response

#### Portfolio
- `GET /api/portfolio` - Get user portfolio
- `POST /api/portfolio` - Add property to portfolio
- `PATCH /api/portfolio/{id}` - Update property
- `DELETE /api/portfolio/{id}` - Remove property

### Server-Sent Events (SSE) Format

The `/api/stream` endpoint must return Server-Sent Events with the following event types:

```javascript
// Init event
{ "type": "init", "thread_id": "abc-123" }

// Thinking state
{ "type": "thinking", "status": "Searching...", "explanation": "I'm searching for properties..." }

// Tool execution
{ "type": "tool_start", "tool": "scout_properties", "thinking": "Searching..." }
{ "type": "tool_end", "tool": "scout_properties", "summary": "Found 10 properties" }

// Content streaming
{ "type": "content", "content": "Based on my analysis..." }

// Completion
{ "type": "done" }

// Error
{ "type": "error", "error": "Error message" }
```

See [`docs/BACKEND_STREAM_IMPLEMENTATION.md`](docs/BACKEND_STREAM_IMPLEMENTATION.md) for complete specification.

### Tool Calls

The AI can invoke various tools:
- `scout_properties` - Property search
- `get_market_stats` - Market data
- `request_pnl_calculation` - P&L analysis
- `check_compliance` - Regulation checks
- `portfolio_analyzer_tool` - Portfolio analysis
- `analyze_property_image` - Image analysis

---

## 🧪 Testing

### Manual Testing

1. **Authentication Flow**
   - Sign up with new account
   - Sign in with credentials
   - Sign out and verify session ends

2. **Chat Interface**
   - Send property search query
   - Verify real-time thinking states
   - Check property cards display correctly

3. **Property Analysis**
   - Open deal analyzer
   - Run P&L calculations
   - Export comparison PDF

4. **Portfolio Management**
   - Add properties to portfolio
   - View portfolio analytics
   - Update and remove properties

### Browser Testing

Tested and working on:
- ✅ Chrome/Edge (Chromium) 120+
- ✅ Firefox 121+
- ✅ Safari 17+

---

## 📦 Deployment

### Build for Production

```bash
# Create production build
npm run build

# Output: dist/ directory
```

### Deployment Options

#### Google Cloud Platform (App Engine)

The project includes `app.yaml` for GCP deployment:

```bash
gcloud app deploy
```

#### Vercel / Netlify

1. Connect GitHub repository
2. Set environment variables
3. Deploy with default Vite settings

#### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

### Environment Configuration

Ensure all `VITE_*` environment variables are set in your deployment platform.

---

## 📚 Documentation

### Available Documentation

- **[Backend Requirements Summary](docs/BACKEND_REQUIREMENTS_SUMMARY.md)** - Complete backend API specification
- **[Backend Stream Implementation](docs/BACKEND_STREAM_IMPLEMENTATION.md)** - SSE streaming guide
- **[Backend Auth API](docs/BACKEND_AUTH_API.md)** - Authentication endpoints
- **[Backend Onboarding API](docs/BACKEND_ONBOARDING_API.md)** - Onboarding flow
- **[Holographic Integration](HOLOGRAPHIC_INTEGRATION.md)** - 3D visualization guide
- **[Feature Implementation](FEATURE_IMPLEMENTATION.md)** - Feature status and changelog
- **[Backend Schema](backend_schema.md)** - Event schema reference

### Key Concepts

#### Thinking States
Real-time AI processing indicators that show:
- What the AI is doing (e.g., "Searching for properties...")
- Which tools are being executed
- Data sources being queried
- Progress through multi-step analysis

#### Property Comparison
Side-by-side comparison of up to 3 properties with:
- Automatic best-value highlighting
- PDF export functionality
- Customizable metrics

#### Holographic View
AI-generated 3D floor plan visualization:
- Procedural generation from property metadata
- Isometric perspective with holographic effects
- Interactive data displays

---

## 🤝 Contributing

### Development Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards

- Write TypeScript, not JavaScript
- Follow existing code patterns
- Add types for all new interfaces
- Document complex logic with comments
- Keep components focused and reusable

### Commit Messages

```
feat: Add property comparison modal
fix: Resolve SSE connection timeout
docs: Update backend integration guide
style: Improve holographic view animations
```

---

## 📄 License

See `LICENSE` file for details.

---

## 🙏 Acknowledgments

- **RentCast API** - Property and market data
- **Firebase** - Authentication infrastructure
- **Tailwind Labs** - TailwindCSS framework
- **Vercel** - Vite and SWC compilation
- **Framer** - Framer Motion animation library

---

## 📞 Support

For questions or issues:
1. Check existing documentation in `/docs`
2. Review `FEATURE_IMPLEMENTATION.md` for feature status
3. Consult conversation history for context
4. Create an issue with detailed description

---

**Last Updated**: 2025-12-22  
**Version**: 1.0.0  
**Status**: 🟢 Production Ready
