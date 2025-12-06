import { AuthProvider } from './contexts/AuthContext';
import { AuthRouter } from './components/auth/AuthRouter';
import { DealAnalyzerDrawer } from './components/analysis/DealAnalyzerDrawer';
import { useAnalysisStore } from './stores/analysisStore';

function App() {
  const { isOpen, closeAnalysis, selectedProperty } = useAnalysisStore();

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
