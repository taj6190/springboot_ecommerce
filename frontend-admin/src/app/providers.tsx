'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 1000 * 60 * 2,   // 2 min
                        retry: 1,
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#1c2333',
                        color: '#e8eaf0',
                        border: '1px solid #2a3348',
                        fontSize: '14px',
                    },
                    success: { iconTheme: { primary: '#22c55e', secondary: '#1c2333' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: '#1c2333' } },
                }}
            />
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
