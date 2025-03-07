import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient, prefetchQueries } from './lib/query-client';
import { ErrorBoundary } from './components/error-boundary';
import { Toaster } from 'sonner';

// Prefetch important queries
prefetchQueries();

// Loading fallback
const LoadingFallback = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center">
      <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-sm text-muted-foreground">Loading application...</p>
    </div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<LoadingFallback />}>
          <App />
          <Toaster position="top-right" richColors closeButton />
        </Suspense>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);