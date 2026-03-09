import React from 'react';
import { ShieldAlert, Lock, ShieldCheck } from 'lucide-react';
import { useBiometrics } from '../../hooks/useBiometrics';

interface BiometricGateProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export const BiometricGate: React.FC<BiometricGateProps> = ({
    children,
    title = "Secure Storage",
    description = "This section contains sensitive documents. Please authenticate to access."
}) => {
    console.log('[BiometricGate] Render started');
    const { isAvailable, isSetup, isAuthenticated, isLoading, error, authenticate, setup } = useBiometrics();
    console.log('[BiometricGate] Hook state:', { isAvailable, isSetup, isAuthenticated, isLoading, error });

    if (isAuthenticated) {
        console.log('[BiometricGate] User is authenticated, rendering children');
        return <>{children}</>;
    }

    const isSetupMode = !isSetup;
    const actionLabel = isSetupMode ? "Setup Biometrics" : "Unlock Vault";
    const headerTitle = isSetupMode ? "Initialize Secure Vault" : title;
    const headerDesc = isSetupMode
        ? "Set up biometric authentication (Face ID or Touch ID) to secure your documents. Your files will be encrypted and only accessible by you."
        : description;

    return (
        <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="max-w-md w-full bg-background border border-black/8 rounded-2xl p-8 flex flex-col items-center text-center shadow-2xl shadow-black/10">

                {/* Icon Circle */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C08B5C]/20 to-purple-500/20 flex items-center justify-center mb-6 ring-1 ring-white/10 relative">
                    {isSetupMode ? (
                        <ShieldCheck className="w-8 h-8 text-foreground/80" />
                    ) : (
                        <Lock className="w-8 h-8 text-foreground/80" />
                    )}
                    {/* Small status indicator */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-black rounded-full flex items-center justify-center border border-black/8">
                        {isSetupMode ? (
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                        ) : (
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                        )}
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-foreground mb-2">{headerTitle}</h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                    {headerDesc}
                </p>

                {error && (
                    <div className="w-full flex items-center gap-2 p-3 mb-6 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <button
                    onClick={isSetupMode ? setup : authenticate}
                    disabled={isLoading}
                    className="w-full h-12 flex items-center justify-center gap-2 bg-white text-black font-semibold rounded-xl hover:bg-white/90 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            <span>{isSetupMode ? 'Registering...' : 'Verifying...'}</span>
                        </>
                    ) : (
                        <>
                            <ShieldCheck className="w-5 h-5" />
                            <span>
                                {isAvailable ? actionLabel : 'Unlock Access'}
                            </span>
                        </>
                    )}
                </button>

                {!isAvailable && !isLoading && (
                    <p className="mt-4 text-xs text-muted-foreground/50">
                        Biometric hardware not detected. Security may fall back to device passcode.
                    </p>
                )}

                <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground/40">
                    <ShieldCheck className="w-3 h-3" />
                    <span>End-to-end encrypted security</span>
                </div>
            </div>
        </div>
    );
};
