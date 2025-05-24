// components/AuthLayout.tsx
import Image from "next/image";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Image F1 en arrière-plan */}
      <Image
        src="/f1-bg.jpg"
        alt="F1 background"
        fill
        priority
        className="fixed inset-0 w-full h-full object-cover object-center z-0"
        style={{ filter: "blur(2px) brightness(0.7)" }}
      />
      {/* Overlay dégradé */}
      <div className="fixed inset-0 bg-gradient-to-br from-black/80 via-black/60 to-red-900/60 z-0" />
      <div className="relative z-10 w-full max-w-md px-4 py-8 bg-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl border-none flex flex-col gap-5 animate-f1-slide mx-2"
        style={{ boxShadow: "0 8px 64px 0 #000a, 0 0 0 1.5px #fff2 inset" }}
      >
        {children}
      </div>
    </div>
  );
}
