import type { Metadata } from "next";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/jetbrains-mono/500.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./globals.css";

import { AppShell } from "@/components/app-shell";
import { ProfileProvider } from "@/components/profile-context";
import { SolanaProvider } from "@/components/solana-provider";

export const metadata: Metadata = {
  title: "FlowEarn — Pay for verified creator reach",
  description:
    "Companies fund X campaigns. Creators earn USDC from verified views with public Solana settlement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body>
        <SolanaProvider>
          <ProfileProvider>
            <AppShell>{children}</AppShell>
          </ProfileProvider>
        </SolanaProvider>
      </body>
    </html>
  );
}
