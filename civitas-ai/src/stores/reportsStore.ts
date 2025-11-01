// TODO: Replace with Firebase
// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

// Temporary in-memory store until Firebase is integrated
let reportsData: Report[] = [];

export interface Report {
  id: string;
  title: string;
  content: string;
  location: string;
  property_details?: {
    price: number;
    roi: number;
    tier: string;
  };
  created_at: string;
  type: 'property_analysis';
}

interface ReportsStore {
  reports: Report[];
  addReport: (report: Omit<Report, 'id' | 'created_at'>) => void;
  getReport: (id: string) => Report | undefined;
  deleteReport: (id: string) => void;
  clearReports: () => void;
}

// TODO: Replace this with Firebase Firestore
export const useReportsStore = (() => {
  const store = {
    reports: reportsData,
    
    addReport: (report: Omit<Report, 'id' | 'created_at'>) => {
      // Generate unique ID using timestamp + random string to avoid collisions
      const uniqueId = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newReport: Report = {
        ...report,
        id: uniqueId,
        created_at: new Date().toISOString(),
      };
      // Always add as new report, never update existing
      reportsData = [newReport, ...reportsData];
      console.log('✅ New report added to local store:', uniqueId);
    },
    
    getReport: (id: string) => {
      return reportsData.find((r) => r.id === id);
    },
    
    deleteReport: (id: string) => {
      reportsData = reportsData.filter((r) => r.id !== id);
    },
    
    clearReports: () => {
      reportsData = [];
    },
    
    getState: () => ({ addReport: store.addReport })
  };
  
  return () => store;
})();
