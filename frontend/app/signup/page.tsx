"use client";
import AuthForm from "@/components/AuthForm";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const handleSignup = async (data: any) => {
    await api.post("/auth/signup", data);
    router.push("/login");
  };

  return <AuthForm onSubmit={handleSignup} isSignup />;
}