import type { Metadata } from "next";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/jetbrains-mono/500.css";
import "./globals.css";

import { AppShell } from "@/components/app-shell";
import { ProfileProvider } from "@/components/profile-context";

export const metadata: Metadata = {
  title: "FlowEarn — Real-time performance bounties",
  description:
    "Creators earn continuously from verified performance and settle privately on Solana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body>
        <ProfileProvider>
          <AppShell>{children}</AppShell>
        </ProfileProvider>
      </body>
    </html>
  );
}
