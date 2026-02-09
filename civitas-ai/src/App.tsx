import { AuthProvider } from './contexts/AuthContext';
import { AuthRouter } from './components/auth/AuthRouter';
import { DealAnalyzerDrawer } from './components/analysis/DealAnalyzerDrawer';
import { useAnalysisStore } from './stores/analysisStore';
import { useAppearance } from './hooks/useAppearance';

function App() {
  const { isOpen, closeAnalysis, selectedProperty } = useAnalysisStore();

  // Apply appearance settings (theme, font size, accent, etc.) to the DOM
  useAppearance();

  return (
    <AuthProvider>
      <AuthRouter />
      <DealAnalyzerDrawer
        isOpen={isOpen}
        onClose={closeAnalysis}
        propertyId={selectedProperty?.id}
        initialPurchasePrice={selectedProperty?.price}
        propertyAddress={selectedProperty?.address}
      />
    </AuthProvider>
  );
}

export default App;
