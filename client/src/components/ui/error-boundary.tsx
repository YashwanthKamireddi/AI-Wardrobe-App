import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF9F6] p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center space-y-6">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-serif font-medium text-gray-900">
                                The Atelier is temporarily unavailable
                            </h1>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                We encountered an unexpected issue while curating your experience.
                                Our digital tailors have been notified.
                            </p>
                        </div>

                        <div className="pt-4">
                            <Button
                                onClick={() => window.location.reload()}
                                className="w-full bg-[#1A1A1A] hover:bg-black text-white rounded-xl h-12"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reload Application
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
