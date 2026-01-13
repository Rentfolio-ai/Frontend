// FILE: src/services/accountingApi.ts
// API service for the Accounting Module

import { logger } from '../utils/logger';

// Determine API Base URL
const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
let baseUrl = (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http')) ? envApiUrl : 'http://localhost:8001';
if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
}
if (baseUrl.endsWith('/api')) {
    baseUrl = baseUrl.slice(0, -4);
}
const API_BASE = baseUrl;
const CIVITAS_API_KEY = import.meta.env.VITE_API_KEY;

// ═══════════════════════════════════════════════════════════════════════════════
// Helper
// ═══════════════════════════════════════════════════════════════════════════════

function getHeaders(): HeadersInit {
    return {
        'Content-Type': 'application/json',
        ...(CIVITAS_API_KEY ? { 'X-API-Key': CIVITAS_API_KEY } : {}),
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

export type AccountType =
    | "asset"
    | "liability"
    | "equity"
    | "revenue"
    | "expense";

export const AccountTypes = {
    ASSET: "asset" as AccountType,
    LIABILITY: "liability" as AccountType,
    EQUITY: "equity" as AccountType,
    REVENUE: "revenue" as AccountType,
    EXPENSE: "expense" as AccountType
};

export interface ChartOfAccount {
    id: string;
    code: string;
    name: string;
    type: AccountType;
    sub_type?: string;
    description?: string;
    is_active: boolean;
    balance?: number; // Calculated on frontend or separate endpoint
}

export interface LedgerEntry {
    id?: string;
    account_id: string;
    debit: number;
    credit: number;
    description?: string;
}

export interface JournalEntry {
    id?: string;
    date: string;
    description: string;
    property_id?: string;
    reference_number?: string;
    entries: LedgerEntry[];
    created_at?: string;
    created_by?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Service
// ═══════════════════════════════════════════════════════════════════════════════

export const accountingService = {
    /**
     * Fetch the Chart of Accounts
     */
    getChartOfAccounts: async (): Promise<ChartOfAccount[]> => {
        logger.info('[accountingApi] Fetching Chart of Accounts');
        const response = await fetch(`${API_BASE}/api/accounting/accounts`, {
            method: 'GET',
            headers: getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch accounts: ${response.statusText}`);
        }

        return response.json();
    },

    /**
     * Create a new Account
     */
    createAccount: async (account: Partial<ChartOfAccount>): Promise<ChartOfAccount> => {
        logger.info('[accountingApi] Creating new account', account);
        const response = await fetch(`${API_BASE}/api/accounting/accounts`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(account),
        });

        if (!response.ok) {
            throw new Error(`Failed to create account: ${response.statusText}`);
        }

        return response.json();
    },

    /**
     * Fetch Recent Transactions
     */
    getTransactions: async (limit: number = 50): Promise<JournalEntry[]> => {
        logger.info(`[accountingApi] Fetching recent transactions (limit: ${limit})`);
        const response = await fetch(`${API_BASE}/api/accounting/transactions?limit=${limit}`, {
            method: 'GET',
            headers: getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch transactions: ${response.statusText}`);
        }

        return response.json();
    },

    /**
     * Create a Journal Entry
     */
    createJournalEntry: async (entry: JournalEntry): Promise<JournalEntry> => {
        logger.info('[accountingApi] Creating journal entry', { entry });
        // Validate balance locally before sending
        const totalDebit = entry.entries.reduce((sum, e) => sum + e.debit, 0);
        const totalCredit = entry.entries.reduce((sum, e) => sum + e.credit, 0);

        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            throw new Error(`Journal Entry is unbalanced. Debits: ${totalDebit}, Credits: ${totalCredit}`);
        }

        const response = await fetch(`${API_BASE}/api/accounting/transactions`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(entry),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || `Failed to create transaction: ${response.statusText}`);
        }

        return response.json();
    }
};
