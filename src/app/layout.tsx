import type { Metadata } from "next";
import { Geist, Geist_Mono, Russo_One, Chakra_Petch } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const russoOne = Russo_One({
  weight: "400",
  variable: "--font-russo-one",
  subsets: ["latin"],
});

const chakraPetch = Chakra_Petch({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-chakra-petch",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Valorant Checker",
  description: "Check your Valorant account items",
};

import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from 'sonner';
import Providers from "./providers";
import { Footer } from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        layout: {
          unsafe_disableDevelopmentModeWarnings: true,
        },
        variables: {
          colorPrimary: "#FF4655",
          colorBackground: "#111111",
          colorText: "#ECE8E1",
          colorInputBackground: "#1F2326",
          colorInputText: "#ECE8E1",
          colorTextSecondary: "#999999",
          borderRadius: "0",
        },
        elements: {
          card: "bg-[#0F1923] border border-[#FF4655]/30 shadow-2xl rounded-none",
          headerTitle: "text-[#ECE8E1] font-black tracking-tighter",
          headerSubtitle: "text-[#999999]",
          socialButtonsBlockButton: "!bg-[#1F2326] !border-white/10 hover:!bg-[#2A2E33] !text-white rounded-none",
          socialButtonsBlockButtonText: "!text-white font-bold",
          formButtonPrimary: "!bg-[#FF4655] hover:!bg-[#ff5e6a] !text-white uppercase font-black rounded-none h-12 shadow-[4px_4px_0px_0px_rgba(255,70,85,0.3)] hover:shadow-none transition-all",
          formFieldLabel: "text-[#ECE8E1] text-[10px] font-bold tracking-widest",
          formFieldInput: "!bg-[#1F2326] !border-white/10 focus:!border-[#FF4655] focus:ring-0 rounded-none text-[#ECE8E1]",
          footerActionLink: "!text-[#FF4655] hover:!text-[#ff5e6a] font-bold",
          footerActionText: "!text-[#999999]",
          identityPreviewTextPrimary: "!text-white",
          identityPreviewTextSecondary: "!text-[#999999]",
          dividerLine: "!bg-white/10",
          dividerText: "!text-[#666666] uppercase text-[10px] font-bold",
        }
      }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} ${russoOne.variable} ${chakraPetch.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-black text-white">
          <Providers>
            <Toaster
              theme="dark"
              position="top-right"
              richColors
            />
            <main className="grow">
              {children}
            </main>
            <Footer />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
