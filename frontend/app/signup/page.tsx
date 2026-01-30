"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "../../lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    username: "",
    displayName: "",
    password: ""
  });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await apiFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify(form)
    });

    if (!res.ok) {
      setError("Não foi possível criar a conta.");
      return;
    }

    await res.json();
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-md glass rounded-3xl p-8">
        <h1 className="text-3xl font-bold mb-2">Cria a tua conta</h1>
        <p className="text-white/60 mb-8">Começa já a partilhar as tuas viagens.</p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <input className="input" placeholder="Nome público" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
          <input className="input" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button className="btn-primary w-full" type="submit">Criar conta</button>
        </form>

        <p className="mt-6 text-sm text-white/60">
          Já tens conta? <Link className="text-cyan" href="/login">Entrar</Link>
        </p>
      </div>
    </main>
  );
}
