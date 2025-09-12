"use client";
import AuthForm from "@/components/AuthForm";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface SignupData { email: string; password: string; username?: string }
export default function SignupPage() {
  const router = useRouter();

  const handleSignup = async (data: SignupData) => {
    await api.post("/auth/signup", data);
    router.push("/login");
  };

  return <AuthForm onSubmit={handleSignup} isSignup />;
}