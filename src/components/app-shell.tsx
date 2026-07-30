"use client";

import {
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Sparkles,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { OnboardingDialog } from "@/components/onboarding-dialog";
import { useProfile } from "@/components/profile-context";
import { SiteFooter } from "@/components/site-footer";
import { WalletButton } from "@/components/wallet-button";

const creatorLinks = [
  { href: "/campaigns", label: "Campaigns" },
  { href: "/projects", label: "Companies" },
  { href: "/dashboard", label: "My earnings" },
];

const companyLinks = [
  { href: "/company", label: "Dashboard" },
  { href: "/company/submissions", label: "Submissions" },
  { href: "/campaigns/new", label: "Launch" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { profile, isReady, openOnboarding, signOut } = useProfile();
  const companyMode =
    pathname.startsWith("/company") || pathname === "/campaigns/new";
  const links = companyMode ? companyLinks : creatorLinks;

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="network-bar">
        <span className="network-dot" aria-hidden />
        Solana devnet
        <span className="network-divider" aria-hidden />
        Public USDC settlement
      </div>
      <header className="app-header">
        <div className="header-inner">
          <Link className="brand focus-ring" href="/" aria-label="FlowEarn home">
            <span className="brand-mark">
              <Sparkles size={17} strokeWidth={2.5} aria-hidden />
            </span>
            <span>flowearn</span>
          </Link>

          <nav className="desktop-nav" aria-label="Primary navigation">
            {links.map((link) => (
              <Link
                key={link.href}
                className={`nav-link focus-ring ${
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(`${link.href}/`))
                    ? "nav-link-active"
                    : ""
                }`}
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <WalletButton />
            <Link className="icon-button focus-ring" aria-label="Search campaigns" href="/#campaigns">
              <Search size={18} aria-hidden />
            </Link>
            <button
              className="icon-button focus-ring"
              aria-label="Notifications"
            >
              <Bell size={18} aria-hidden />
            </button>
            <Link
              className="mode-switch focus-ring"
              href={companyMode ? "/" : "/company"}
            >
              {companyMode ? (
                <UserRound size={16} aria-hidden />
              ) : (
                <BriefcaseBusiness size={16} aria-hidden />
              )}
              {companyMode ? "Creator mode" : "Company mode"}
            </Link>
            {isReady && profile ? (
              <div className="profile-menu-wrap">
                <button
                  aria-expanded={profileOpen}
                  className="profile-button focus-ring"
                  type="button"
                  onClick={() => setProfileOpen((open) => !open)}
                >
                  <span className="header-avatar">
                    {profile.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span>{profile.name.split(" ")[0]}</span>
                  <ChevronDown size={14} aria-hidden />
                </button>
                {profileOpen && (
                  <div className="profile-menu">
                    <div>
                      <strong>{profile.name}</strong>
                      <small>
                        {profile.mode === "creator"
                          ? profile.handle
                            ? `@${profile.handle}`
                            : "X connects before submission"
                          : profile.handle}
                      </small>
                    </div>
                    <button
                      className="focus-ring"
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        openOnboarding();
                      }}
                    >
                      <UserRound size={15} aria-hidden />
                      Edit profile
                    </button>
                    <button
                      className="focus-ring"
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        signOut();
                      }}
                    >
                      <LogOut size={15} aria-hidden />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="wallet-button focus-ring"
                type="button"
                onClick={openOnboarding}
              >
                <WalletCards size={16} aria-hidden />
                Sign in
              </button>
            )}
            <button
              className="mobile-menu-button focus-ring"
              type="button"
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              className="mobile-nav-link focus-ring"
              href={link.href}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            className="mobile-nav-link focus-ring"
            href={companyMode ? "/" : "/company"}
            onClick={() => setMobileOpen(false)}
          >
            {companyMode ? "Switch to creator" : "Switch to company"}
          </Link>
          {!profile && (
            <button
              className="mobile-signin focus-ring"
              type="button"
              onClick={() => {
                setMobileOpen(false);
                openOnboarding();
              }}
            >
              Sign in or create profile
            </button>
          )}
        </nav>
      )}

      {children}
      <SiteFooter />
      <OnboardingDialog />
    </div>
  );
}
