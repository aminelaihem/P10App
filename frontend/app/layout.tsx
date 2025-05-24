// app/layout.tsx
import "@/styles/globals.css";
import { ReactNode } from "react";
import { Barlow_Condensed, Orbitron } from "next/font/google";

const barlow = Barlow_Condensed({
  weight: ["600"],
  subsets: ["latin"],
  variable: "--font-barlow",
});

const orbitron = Orbitron({
  weight: ["700"],
  subsets: ["latin"],
  variable: "--font-orbitron",
});

export const metadata = {
  title: "P10App - F1 Fantasy",
  description: "Plateforme de paris Formule 1",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head />
      <body
        className={`${barlow.variable} ${orbitron.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
