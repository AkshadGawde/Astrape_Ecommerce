"use client";
import AuthForm from "@/components/AuthForm";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (data: any) => {
    const res = await api.post("/auth/login", data);
    await login(res.data.access_token);
    router.push("/items");
  };

  return <AuthForm onSubmit={handleLogin} />;
}