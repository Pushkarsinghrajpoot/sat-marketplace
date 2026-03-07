import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import ClientProvider from './client-provider';
import { ChatbotWidget } from '@/components/chatbot-widget';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "B2B Marketplace - Connect. Trade. Grow Your Business",
  description: "The trusted B2B marketplace connecting distributors and resellers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ClientProvider>
          {children}
          <Toaster position="top-right" richColors />
          <ChatbotWidget />
        </ClientProvider>
      </body>
    </html>
  );
}
