import { ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-grid">
        <div className="footer-brand-block">
          <Link className="brand focus-ring" href="/" aria-label="FlowEarn home">
            <span className="brand-mark">
              <Sparkles size={17} strokeWidth={2.5} aria-hidden />
            </span>
            <span>flowearn</span>
          </Link>
          <p>
            Verified X performance becomes public USDC earnings for creators.
          </p>
          <a
            className="footer-social focus-ring"
            href="https://x.com"
            rel="noreferrer"
            target="_blank"
          >
            Follow the build <ArrowUpRight size={14} aria-hidden />
          </a>
        </div>
        <div>
          <h2>Product</h2>
          <Link href="/campaigns">Browse campaigns</Link>
          <Link href="/projects">Browse companies</Link>
          <Link href="/campaigns/new">Launch a campaign</Link>
          <Link href="/dashboard">Creator dashboard</Link>
        </div>
        <div>
          <h2>Principles</h2>
          <span>Official X metrics</span>
          <span>Funded USDC pools</span>
          <span>Refundable budget</span>
          <span>Public Solana settlement</span>
        </div>
      </div>
      <div className="site-footer-bottom">
        <span>© 2026 FlowEarn</span>
        <span>
          <ShieldCheck size={14} aria-hidden />
          Public payouts. Verifiable campaign accounting.
        </span>
      </div>
    </footer>
  );
}
