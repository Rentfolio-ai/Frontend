import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// Define the shape of an App Intent (Chat -> App)
export interface AppIntent {
    action: 'launch' | 'update_view' | 'trigger_action';
    appId: string;
    view?: string;
    context?: Record<string, any>; // The data to pass to the app
}

// Define the shape of App Context (App -> Chat)
export interface AppContextState {
    appId: string;
    view?: string;
    data: Record<string, any>;
    timestamp: number;
}

interface BridgeContextType {
    // State
    activeAppId: string | null;
    activeContext: AppContextState | null;

    // Actions
    broadcastContext: (appId: string, data: Record<string, any>, view?: string) => void;
    handleAppIntent: (intent: AppIntent) => void;

    // Navigation helpers
    openApp: (appId: string, context?: Record<string, any>) => void;
    closeApp: () => void;
}

const BridgeContext = createContext<BridgeContextType | undefined>(undefined);

export const BridgeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeAppId, setActiveAppId] = useState<string | null>(null);
    const [activeContext, setActiveContext] = useState<AppContextState | null>(null);

    // Called by Apps to let Chat know what's happening
    const broadcastContext = useCallback((appId: string, data: Record<string, any>, view?: string) => {
        // Only update if it's the active app (prevent background noise)
        if (appId === activeAppId) {
            setActiveContext({
                appId,
                view,
                data,
                timestamp: Date.now(),
            });
            // In a real implementation, this might also silently send a message to the LLM context window
            console.log(`[Bridge] Context received from ${appId}:`, data);
        }
    }, [activeAppId]);

    // Called by Chat (via Tools/Launcher) to drive the App
    const handleAppIntent = useCallback((intent: AppIntent) => {
        console.log('[Bridge] Handling Intent:', intent);

        switch (intent.action) {
            case 'launch':
                setActiveAppId(intent.appId);
                // If there's context, immediately set it so the app can hydrate
                if (intent.context) {
                    // We might need a mechanism to pass this "initial props" to the app
                    // For now, we'll store it in activeContext as a signal
                    setActiveContext({
                        appId: intent.appId,
                        view: intent.view,
                        data: intent.context,
                        timestamp: Date.now()
                    });
                }
                break;

            case 'update_view':
                // Logic to signal the active app to change views
                // This usually requires an event bus or more complex state management 
                // if the app components aren't observing this context directly.
                break;

            default:
                console.warn('Unknown intent action:', intent.action);
        }
    }, []);

    const openApp = useCallback((appId: string, context?: Record<string, any>) => {
        handleAppIntent({
            action: 'launch',
            appId,
            context
        });
    }, [handleAppIntent]);

    const closeApp = useCallback(() => {
        setActiveAppId(null);
        setActiveContext(null);
    }, []);

    return (
        <BridgeContext.Provider
            value={{
                activeAppId,
                activeContext,
                broadcastContext,
                handleAppIntent,
                openApp,
                closeApp
            }}
        >
            {children}
        </BridgeContext.Provider>
    );
};

export const useBridge = () => {
    const context = useContext(BridgeContext);
    if (context === undefined) {
        throw new Error('useBridge must be used within a BridgeProvider');
    }
    return context;
};
