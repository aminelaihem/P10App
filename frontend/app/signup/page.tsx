"use client";

import { useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaUserPlus } from "react-icons/fa";
import Link from "next/link";
import Input from "@/components/Input";
import Button from "@/components/Button";
import AvatarSelector from "@/components/AvatarSelector";
import AuthLayout from "@/components/AuthLayout";

export default function SignupPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstname: "",
    lastname: "",
    avatarId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    if (name === "password" || name === "confirmPassword") {
      setPasswordMatch(
        name === "password"
          ? value === form.confirmPassword
          : value === form.password
      );
    }
  };

  const handleAvatarSelect = (avatarId: string) => {
    setForm((prev) => ({ ...prev, avatarId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (!passwordMatch) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
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
        <FaUserPlus className="text-f1red text-3xl drop-shadow-f1" />
        <h2 className="text-3xl font-f1 font-bold text-white tracking-widest uppercase">Inscription</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            name="firstname"
            placeholder="Prénom"
            icon={FaUser}
            value={form.firstname}
            onChange={handleChange}
            required
          />
          <Input
            name="lastname"
            placeholder="Nom"
            icon={FaUser}
            value={form.lastname}
            onChange={handleChange}
            required
          />
        </div>

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
        <Input
          name="confirmPassword"
          type="password"
          placeholder="Confirmer le mot de passe"
          icon={FaLock}
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />

        <AvatarSelector onSelect={handleAvatarSelect} selectedAvatarId={form.avatarId} />

        {!passwordMatch && (
          <div className="text-f1red text-sm text-center font-semibold animate-pulse">
            Les mots de passe ne correspondent pas.
          </div>
        )}
        {error && <div className="text-f1red text-base text-center font-semibold animate-pulse">{error}</div>}
        {success && <div className="text-f1yellow text-base text-center font-semibold animate-f1-glow">Inscription réussie !</div>}

        <Button loading={loading} label="Start Engine" />
      </form>

      <div className="text-center text-base mt-2 text-white/90 font-barlow">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-f1red hover:underline font-bold">Se connecter</Link>
      </div>
    </AuthLayout>
  );
}