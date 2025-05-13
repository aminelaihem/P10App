import { useState } from "react";
import Link from "next/link";
import { FaFlagCheckered, FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa";
import Image from "next/image";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
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
    setTimeout(() => { setSuccess(true); setLoading(false); }, 1200); // démo
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <Image src="/f1-bg.jpg" alt="F1 background" fill priority className="fixed inset-0 w-full h-full object-cover object-center z-0" style={{filter:'blur(2px) brightness(0.7)'}} />
      <div className="fixed inset-0 bg-gradient-to-br from-black/80 via-black/60 to-red-900/60 z-0" />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md px-4 py-8 bg-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl flex flex-col gap-5 animate-f1-slide border-none mx-2"
        autoComplete="off"
        style={{boxShadow:'0 8px 64px 0 #000a, 0 0 0 1.5px #fff2 inset'}}
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <FaSignInAlt className="text-f1red text-3xl drop-shadow-f1" />
          <h2 className="text-3xl font-f1 font-bold text-white tracking-widest uppercase">Connexion</h2>
        </div>
        <div className="input-group-f1">
          <FaEnvelope className="input-icon-f1 text-f1red" />
          <input
            name="email"
            id="email"
            type="email"
            className="input-f1"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="off"
            placeholder="Email"
            aria-label="Email"
          />
        </div>
        <div className="input-group-f1">
          <FaLock className="input-icon-f1 text-f1red" />
          <input
            name="password"
            id="password"
            type="password"
            className="input-f1"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="off"
            placeholder="Mot de passe"
            aria-label="Mot de passe"
          />
        </div>
        {error && <div className="text-f1red text-base text-center font-semibold animate-pulse">{error}</div>}
        {success && <div className="text-f1yellow text-base text-center font-semibold animate-f1-glow">Connexion réussie !</div>}
        <button
          type="submit"
          className={`btn-f1-red mt-2 flex items-center justify-center gap-3 ${loading ? "animate-f1-pulse" : ""}`}
          disabled={loading}
        >
          <FaFlagCheckered className="text-2xl text-f1red" />
          {loading ? <span className="loader-f1-red" /> : "Start Engine"}
        </button>
        <div className="text-center text-base mt-2 text-white/90 font-barlow">
          Pas encore de compte ?{' '}
          <Link href="/signup" className="text-f1red hover:underline font-bold">Créer un compte</Link>
        </div>
      </form>
      <style jsx global>{`
        .font-f1 {
          font-family: 'Barlow Condensed', 'Orbitron', Arial, sans-serif;
          letter-spacing: 0.08em;
        }
        .font-barlow {
          font-family: 'Barlow Condensed', Arial, sans-serif;
        }
        .text-f1red { color: #d90429 !important; }
        .text-f1yellow { color: #ffe600 !important; }
        .drop-shadow-f1 { filter: drop-shadow(0 0 12px #d90429cc); }
        .input-group-f1 {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.13);
          border-radius: 1.5em;
          box-shadow: 0 2px 16px #0008, 0 2px 24px #d9042920;
          margin-bottom: 0.2em;
          transition: box-shadow 0.18s, background 0.18s;
          overflow: hidden;
        }
        .input-group-f1:focus-within {
          box-shadow: 0 0 0 4px #d9042999, 0 2px 24px #d9042920;
          background: rgba(255,255,255,0.18);
        }
        .input-icon-f1 {
          margin-left: 1.1em;
          margin-right: 0.5em;
          color: #d90429;
          font-size: 1.2em;
          opacity: 0.85;
          pointer-events: none;
        }
        .input-f1 {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-family: 'Barlow Condensed', Arial, sans-serif;
          font-size: 1.15em;
          font-weight: 700;
          padding: 1.1em 1.2em 1.1em 0.2em;
          border-radius: 1.5em;
          letter-spacing: 0.04em;
          transition: background 0.18s, color 0.18s;
        }
        .input-f1::placeholder {
          color: #fff;
          opacity: 0.7;
          font-weight: 500;
          letter-spacing: 0.04em;
        }
        .btn-f1-red {
          @apply w-full py-3 rounded-2xl bg-gradient-to-r from-f1red via-black to-f1red text-white font-f1 text-xl font-bold shadow-lg border-none transition duration-200;
          box-shadow: 0 0 32px 8px #d90429cc, 0 2px 8px #000a;
          text-shadow: 0 0 12px #fff, 0 0 2px #d90429;
          letter-spacing: 0.12em;
          position: relative;
          overflow: hidden;
          border-radius: 1.5em;
          background: linear-gradient(90deg, #d90429 0%, #1a1a1a 100%);
        }
        .btn-f1-red:focus, .btn-f1-red:hover {
          outline: none;
          box-shadow: 0 0 0 4px #d9042999, 0 2px 8px #000a;
          color: #fff;
        }
        .btn-f1-red .loader-f1-red {
          display: inline-block;
          width: 1.5em;
          height: 1.5em;
          border: 3px solid #d90429;
          border-top: 3px solid #fff;
          border-radius: 50%;
          animation: f1spin 0.7s linear infinite;
          margin-left: 0.5em;
        }
        @keyframes f1spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-f1-slide {
          animation: f1slide 0.7s cubic-bezier(.4,0,.2,1);
        }
        @keyframes f1slide {
          from { opacity: 0; transform: translateY(60px) scale(0.98); }
          to { opacity: 1; transform: none; }
        }
        .animate-f1-glow {
          animation: f1glow 1.2s ease-in-out infinite alternate;
        }
        @keyframes f1glow {
          from { text-shadow: 0 0 8px #ffe600, 0 0 2px #d90429; }
          to { text-shadow: 0 0 24px #ffe600, 0 0 8px #d90429; }
        }
        .animate-f1-pulse {
          animation: f1pulse 0.8s infinite alternate;
        }
        @keyframes f1pulse {
          from { box-shadow: 0 0 32px 8px #d90429cc, 0 2px 8px #000a; }
          to { box-shadow: 0 0 64px 16px #ffe600cc, 0 2px 8px #000a; }
        }
        .text-white\/90 { color: rgba(255,255,255,0.90); }
        .from-f1red { --tw-gradient-from: #d90429; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(217 4 41/0)); }
        .to-f1red { --tw-gradient-to: #d90429; }
        @media (max-width: 640px) {
          form {
            padding: 1.2em 0.5em !important;
            border-radius: 1.2em !important;
            box-shadow: 0 4px 32px #000a, 0 0 0 1px #fff2 inset !important;
          }
          .input-group-f1 {
            border-radius: 1em !important;
          }
          .input-f1 {
            font-size: 1em !important;
            padding: 1em 1em 1em 0.2em !important;
            border-radius: 1em !important;
          }
        }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Barlow+Condensed:wght@600&display=swap" rel="stylesheet" />
    </div>
  );
} 