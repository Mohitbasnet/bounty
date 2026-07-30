"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type AccountMode = "creator" | "company";
export type CreatorFocus = "Thread" | "Video" | "Visual";

export type DemoProfile = {
  mode: AccountMode;
  name: string;
  handle: string;
  focus: CreatorFocus;
  skills: string[];
};

type ProfileContextValue = {
  profile: DemoProfile | null;
  isReady: boolean;
  onboardingOpen: boolean;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  saveProfile: (profile: DemoProfile) => void;
  signOut: () => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);
const STORAGE_KEY = "flowearn-demo-profile";
const creatorFocuses: CreatorFocus[] = ["Thread", "Video", "Visual"];

function parseStoredProfile(value: string): DemoProfile | null {
  const parsed = JSON.parse(value) as Partial<DemoProfile>;
  if (
    typeof parsed.name !== "string" ||
    typeof parsed.handle !== "string" ||
    (parsed.mode !== "creator" && parsed.mode !== "company")
  ) {
    return null;
  }

  const focus = creatorFocuses.includes(parsed.focus as CreatorFocus)
    ? (parsed.focus as CreatorFocus)
    : "Thread";

  return {
    mode: parsed.mode,
    name: parsed.name,
    handle: parsed.handle,
    focus,
    skills:
      Array.isArray(parsed.skills) &&
      parsed.skills.every((skill) => typeof skill === "string")
        ? parsed.skills
        : ["X threads"],
  };
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<DemoProfile | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  useEffect(() => {
    const syncProfile = window.setTimeout(() => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const storedProfile = parseStoredProfile(stored);
          if (storedProfile) {
            setProfile(storedProfile);
            window.localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify(storedProfile),
            );
          } else {
            window.localStorage.removeItem(STORAGE_KEY);
          }
        } catch {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
      setIsReady(true);
    }, 0);

    return () => window.clearTimeout(syncProfile);
  }, []);

  function saveProfile(nextProfile: DemoProfile) {
    setProfile(nextProfile);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile));
    setOnboardingOpen(false);
  }

  function signOut() {
    setProfile(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isReady,
        onboardingOpen,
        openOnboarding: () => setOnboardingOpen(true),
        closeOnboarding: () => setOnboardingOpen(false),
        saveProfile,
        signOut,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used inside ProfileProvider");
  }
  return context;
}
