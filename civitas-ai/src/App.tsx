import { AuthProvider } from './contexts/AuthContext';
import { AuthRouter } from './components/auth/AuthRouter';

function App() {
  return (
    <AuthProvider>
      <AuthRouter />
    </AuthProvider>
  );
}

export default App;
