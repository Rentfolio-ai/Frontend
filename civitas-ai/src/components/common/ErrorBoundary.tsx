import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children?: ReactNode;
    /** Optional fallback label shown in the error card (e.g. "Reports") */
    pageName?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="h-full flex flex-col items-center justify-center p-8 text-white" style={{ backgroundColor: '#111114' }}>
                    <div className="max-w-md w-full rounded-xl bg-white/[0.04] border border-white/[0.08] p-6 text-center">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/15 flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-[15px] font-semibold text-white/85 mb-1">
                            {this.props.pageName ? `${this.props.pageName} crashed` : 'Something went wrong'}
                        </h2>
                        <p className="text-[12px] text-white/40 mb-4">
                            An unexpected error occurred. You can try again or go back.
                        </p>
                        <pre className="bg-black/30 p-3 rounded-lg text-[10px] text-red-300/70 whitespace-pre-wrap text-left mb-4 max-h-32 overflow-auto">
                            {this.state.error?.message || this.state.error?.toString()}
                        </pre>
                        <button
                            onClick={this.handleRetry}
                            className="px-4 py-2 rounded-lg bg-[#C08B5C] text-white text-[12px] font-medium hover:bg-[#A8734A] transition-colors"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
