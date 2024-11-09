"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, ReactNode, useEffect, useState } from "react";

// Create a client
const queryClient = new QueryClient();

export const Username = createContext<string | null>(null);

export default function ClientProvider({ children }: { children: ReactNode }) {
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        let username = sessionStorage.getItem("translate_username");
        if (!username) {
            const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz".split("");
            let str = "";
            for (let i = 0; i < 16; i++) {
                str += chars[Math.floor(Math.random() * chars.length)];
            }
            username = str;
            sessionStorage.setItem("translate_username", username);
        }

        setUsername(username);
    }, []);

    return (
        <Username.Provider value={username}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </Username.Provider>
    );
}
