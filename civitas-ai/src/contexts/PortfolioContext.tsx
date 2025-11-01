// FILE: src/contexts/PortfolioContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  type: 'owned' | 'searched' | 'watching';
  addedAt: string;
  metadata?: {
    price?: number;
    bedrooms?: number;
    bathrooms?: number;
    sqft?: number;
  };
}

interface MarketContext {
  city: string;
  state: string;
  propertyCount: number;
  lastSearched?: string;
}

interface PortfolioContextType {
  properties: Property[];
  marketContexts: MarketContext[];
  addProperty: (property: Omit<Property, 'id' | 'addedAt'>) => void;
  removeProperty: (id: string) => void;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  getMarketProperties: (city: string, state: string) => Property[];
  getRecentSearches: () => Property[];
  getOwnedProperties: () => Property[];
  isTrackingMarket: (city: string, state: string) => boolean;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [marketContexts, setMarketContexts] = useState<MarketContext[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('civitas_portfolio');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setProperties(data.properties || []);
        setMarketContexts(data.marketContexts || []);
      } catch (error) {
        console.error('Failed to load portfolio:', error);
      }
    }
  }, []);

  // Save to localStorage whenever properties change
  useEffect(() => {
    localStorage.setItem('civitas_portfolio', JSON.stringify({
      properties,
      marketContexts,
    }));

    // Update market contexts
    updateMarketContexts();
  }, [properties]);

  const updateMarketContexts = () => {
    const contexts = new Map<string, MarketContext>();
    
    properties.forEach(prop => {
      const key = `${prop.city},${prop.state}`;
      const existing = contexts.get(key);
      
      if (existing) {
        existing.propertyCount++;
        if (prop.addedAt > (existing.lastSearched || '')) {
          existing.lastSearched = prop.addedAt;
        }
      } else {
        contexts.set(key, {
          city: prop.city,
          state: prop.state,
          propertyCount: 1,
          lastSearched: prop.addedAt,
        });
      }
    });

    setMarketContexts(Array.from(contexts.values()));
  };

  const addProperty = (property: Omit<Property, 'id' | 'addedAt'>) => {
    const newProperty: Property = {
      ...property,
      id: `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      addedAt: new Date().toISOString(),
    };
    
    setProperties(prev => [...prev, newProperty]);
  };

  const removeProperty = (id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id));
  };

  const updateProperty = (id: string, updates: Partial<Property>) => {
    setProperties(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  const getMarketProperties = (city: string, state: string) => {
    return properties.filter(p => 
      p.city.toLowerCase() === city.toLowerCase() && 
      p.state.toLowerCase() === state.toLowerCase()
    );
  };

  const getRecentSearches = () => {
    return properties
      .filter(p => p.type === 'searched')
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
      .slice(0, 10);
  };

  const getOwnedProperties = () => {
    return properties.filter(p => p.type === 'owned');
  };

  const isTrackingMarket = (city: string, state: string) => {
    return properties.some(p => 
      p.city.toLowerCase() === city.toLowerCase() && 
      p.state.toLowerCase() === state.toLowerCase()
    );
  };

  return (
    <PortfolioContext.Provider value={{
      properties,
      marketContexts,
      addProperty,
      removeProperty,
      updateProperty,
      getMarketProperties,
      getRecentSearches,
      getOwnedProperties,
      isTrackingMarket,
    }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within PortfolioProvider');
  }
  return context;
};
