# Contributing to Vasthu AI — Frontend

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/Rentfolio-ai/frontend.git
   cd frontend/civitas-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase config and backend URL
   ```

4. **Start the dev server**
   ```bash
   npm run dev
   ```
   The frontend runs on `http://localhost:5173` by default (Vite).

5. **Start the backend** (required)
   - DataLayer on port 8001
   - Vasthu agentic layer on port 8000
   - The Vite config proxies `/api` requests to the backend automatically

## Tech Stack

- **React** with TypeScript
- **Vite** for build tooling
- **TailwindCSS** for styling
- **Firebase Auth** for authentication
- **Lucide** for icons

## Project Structure

```
src/
├── components/    # Reusable UI components
├── pages/         # Route-level page components
├── services/      # API client and Firebase auth
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
```

## Code Style

- Use TypeScript for all new code
- Follow existing component patterns
- Use TailwindCSS for styling (avoid inline styles)
- Keep components focused and composable

## Pull Requests

1. Fork the repo and create a feature branch
2. Make focused, incremental changes
3. Test your changes locally with the full stack running
4. Submit a PR with a clear description

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
