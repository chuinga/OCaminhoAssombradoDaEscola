import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/halloween-theme.css";
import "../styles/accessibility.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "O Caminho Assombrado da Escola",
  description: "Um jogo web 2D side-scroller onde uma criança deve navegar de casa até à escola evitando monstros assombrados.",
};

import { ColorblindFilters } from "../components/ui/ColorblindFilters";
import { AccessibilityProvider } from "../components/AccessibilityProvider";
import { KeyboardNavigationHelper } from "../components/ui/KeyboardNavigationHelper";
import { GlobalScreenReaderAnnouncer } from "../components/ui/GlobalScreenReaderAnnouncer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased respect-motion-preference`}
      >
        <ColorblindFilters />
        <a 
          href="#main-content" 
          className="skip-nav"
          aria-label="Saltar para o conteúdo principal"
        >
          Saltar para o conteúdo principal
        </a>
        <AccessibilityProvider>
          <main id="main-content">
            {children}
          </main>
          <KeyboardNavigationHelper />
          <GlobalScreenReaderAnnouncer />
        </AccessibilityProvider>
      </body>
    </html>
  );
}
