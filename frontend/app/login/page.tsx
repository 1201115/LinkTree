"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      setError("Credenciais inválidas.");
      return;
    }

    await res.json();
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-md glass rounded-3xl p-8">
        <h1 className="text-3xl font-bold mb-2">Bem-vindo de volta</h1>
        <p className="text-white/60 mb-8">Entra para gerir o teu TripTree.</p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="input" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button className="btn-primary w-full" type="submit">Entrar</button>
        </form>

        <p className="mt-6 text-sm text-white/60">
          Ainda não tens conta? <Link className="text-cyan" href="/signup">Criar conta</Link>
        </p>
      </div>
    </main>
  );
}
