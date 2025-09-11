"use client";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [user, router]);

  if (loading) {
    return (<div className="flex justify-center items-center h-screen">Loading...</div>);
  }
  if (!user) return null;
  return (<>{children}</>);
}
}