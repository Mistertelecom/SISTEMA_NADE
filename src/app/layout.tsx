import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from './providers'

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema de Ocorrência Escolar - NADE",
  description: "Sistema completo para registro e gestão de ocorrências escolares",
  icons: {
    icon: "/PREFEITURA.png",
    shortcut: "/PREFEITURA.png",
    apple: "/PREFEITURA.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
