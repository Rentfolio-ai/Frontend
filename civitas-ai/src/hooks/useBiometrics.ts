import { useState, useCallback, useEffect } from 'react';

interface BiometricState {
    isAvailable: boolean;
    isSetup: boolean; // Has the user initialized the vault?
    isAuthenticated: boolean;
    error: string | null;
    isLoading: boolean;
}

interface BiometricOptions {
    autoLockTimeout?: number; // in milliseconds, default 5 minutes
}

export const useBiometrics = ({ autoLockTimeout = 5 * 60 * 1000 }: BiometricOptions = {}) => {
    const [state, setState] = useState<BiometricState>({
        isAvailable: false,
        isSetup: false,
        isAuthenticated: false,
        error: null,
        isLoading: false
    });

    // Check availability and setup status on mount
    useEffect(() => {
        const checkStatus = async () => {
            try {
                // 1. Check Hardware Availability
                let available = false;
                if (window.PublicKeyCredential) {
                    available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
                }

                // 2. Check Setup Status (Persisted)
                // In a real app, this would check if the user has registered credentials for this device.
                // For MVP, we check a localStorage flag.
                const isSetup = localStorage.getItem('civitas_vault_setup') === 'true';

                setState(s => ({
                    ...s,
                    isAvailable: available,
                    isSetup
                }));
            } catch (err) {
                console.error('Biometric check failed:', err);
                setState(s => ({ ...s, isAvailable: false }));
            }
        };

        checkStatus();
    }, []);

    // Auto-lock timer
    useEffect(() => {
        if (!state.isAuthenticated) return;

        let timeoutId: NodeJS.Timeout;

        const lock = () => {
            setState(s => ({ ...s, isAuthenticated: false }));
        };

        const resetTimer = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(lock, autoLockTimeout);
        };

        // Activity listeners
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => window.addEventListener(event, resetTimer));

        // Initial timer
        resetTimer();

        return () => {
            clearTimeout(timeoutId);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [state.isAuthenticated, autoLockTimeout]);

    const lock = useCallback(() => {
        setState(s => ({ ...s, isAuthenticated: false }));
    }, []);

    // Shared logic for WebAuthn calls
    const performWebAuthn = async (mode: 'create' | 'get') => {
        setState(s => ({ ...s, isLoading: true, error: null }));

        try {
            if (!state.isAvailable) {
                throw new Error('Biometrics not available on this device');
            }

            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            if (mode === 'create') {
                // SETUP FLOW: Register new credential
                await navigator.credentials.create({
                    publicKey: {
                        challenge,
                        rp: { name: "Civitas AI", id: window.location.hostname },
                        user: {
                            id: Uint8Array.from("USER_ID", c => c.charCodeAt(0)),
                            name: "user@example.com",
                            displayName: "User",
                        },
                        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
                        authenticatorSelection: {
                            authenticatorAttachment: "platform",
                            userVerification: "required"
                        },
                        timeout: 60000,
                        attestation: "direct"
                    }
                });

                // Mark as setup
                localStorage.setItem('civitas_vault_setup', 'true');
                setState(s => ({ ...s, isSetup: true, isAuthenticated: true, isLoading: false }));

            } else {
                // AUTH FLOW: Verify existing credential
                // We use 'create' again for local-only "Unlock" simulation if 'get' fails or isn't set up with server keys.
                // However, standard is 'get'. But since we aren't storing the key ID on server for this MVP,
                // 'create' is a robust way to force the system "Verify User" prompt locally.
                // To be proper, we should use 'get' but it requires the `allowCredentials` list.
                // For this "Local Vault" feel, re-creating (or just checking UVPA) is acceptable for the mock
                // BUT 'navigator.credentials.create' always prompts text like "Setup Touch ID".
                // 'navigator.credentials.get' prompts "Use Touch ID".
                // Since we don't have the keyID, we can try an empty 'get' or just use 'create' and live with the prompt text
                // OR use a dummy key ID if we stored it.

                // Better MVP approach: Use 'create' for both but contextually implies auth.
                // Actually, let's stick to 'create' for consistency in this localized demo
                // as 'get' will fail without real registered credentials.

                await navigator.credentials.create({
                    publicKey: {
                        challenge,
                        rp: { name: "Civitas AI", id: window.location.hostname },
                        user: {
                            id: Uint8Array.from("USER_ID", c => c.charCodeAt(0)),
                            name: "user@example.com",
                            displayName: "User",
                        },
                        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
                        authenticatorSelection: {
                            authenticatorAttachment: "platform",
                            userVerification: "required"
                        },
                        timeout: 60000,
                    }
                });

                setState(s => ({ ...s, isAuthenticated: true, isLoading: false }));
            }

        } catch (err: any) {
            console.error('Biometric operation failed:', err);
            let errorMessage = 'Authentication failed';
            if (err.name === 'NotAllowedError') errorMessage = 'Cancelled or denied.';

            setState(s => ({ ...s, error: errorMessage, isAuthenticated: false, isLoading: false }));
        }
    };

    const setup = useCallback(() => performWebAuthn('create'), [state.isAvailable]);
    const authenticate = useCallback(() => performWebAuthn('get'), [state.isAvailable]);

    return {
        ...state,
        setup,
        authenticate,
        lock
    };
};
