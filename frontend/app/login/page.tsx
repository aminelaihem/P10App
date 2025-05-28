"use client";

import { useState } from "react";
import { FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa";
import Link from "next/link";
import Input from "@/components/Input";
import Button from "@/components/Button";
import AuthLayout from "@/components/AuthLayout";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur inconnue");
      } else {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = "/";
        }, 1200);
      }
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex items-center justify-center gap-3 mb-2">
        <FaSignInAlt className="text-f1red text-3xl drop-shadow-f1" />
        <h2 className="text-3xl font-f1 font-bold text-white tracking-widest uppercase">Connexion</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          name="email"
          type="email"
          placeholder="Email"
          icon={FaEnvelope}
          value={form.email}
          onChange={handleChange}
          required
        />
        <Input
          name="password"
          type="password"
          placeholder="Mot de passe"
          icon={FaLock}
          value={form.password}
          onChange={handleChange}
          required
        />

        {error && <div className="text-f1red text-base text-center font-semibold animate-pulse">{error}</div>}
        {success && <div className="text-f1yellow text-base text-center font-semibold animate-f1-glow">Connexion réussie !</div>}

        <Button loading={loading} />
      </form>

      <div className="text-center text-base mt-2 text-white/90 font-barlow">
        Pas encore de compte ?{" "}
        <Link href="/signup" className="text-f1red hover:underline font-bold">Créer un compte</Link>
      </div>
    </AuthLayout>
  );
}