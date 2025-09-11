"use client";
import { ReactNode, useState } from "react";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function Providers({ children }: { children: ReactNode }) {
  // Lazily create QueryClient once
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Navbar />
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}