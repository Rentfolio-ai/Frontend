import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/common/ErrorBoundary'

console.log('[Main] Application starting...');

try {
  const root = createRoot(document.getElementById('root')!);
  console.log('[Main] Root created, rendering...');

  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
  console.log('[Main] Render called');
} catch (e) {
  console.error('[Main] Error during startup:', e);
}
