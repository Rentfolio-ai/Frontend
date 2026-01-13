import { AuthProvider } from './contexts/AuthContext';
import { AuthRouter } from './components/auth/AuthRouter';
import { BridgeProvider } from './contexts/BridgeContext';
import { DealAnalyzerDrawer } from './components/analysis/DealAnalyzerDrawer';
import { useAnalysisStore } from './stores/analysisStore';

function App() {
  const { isOpen, closeAnalysis, selectedProperty } = useAnalysisStore();

  return (
    <AuthProvider>
      <BridgeProvider>
        <AuthRouter />
        <DealAnalyzerDrawer
          isOpen={isOpen}
          onClose={closeAnalysis}
          propertyId={selectedProperty?.id}
          initialPurchasePrice={selectedProperty?.price}
          propertyAddress={selectedProperty?.address}
        />
      </BridgeProvider>
    </AuthProvider>
  );
}

export default App;
