import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { generateLabeledDemoScanHistory } from "@/lib/demoScanHistory";
import type { BodyMeasurement, ScanRecord, ScanDataSource, UserProfile } from "@/context/types";

export type { BodyMeasurement, ScanRecord, UserProfile, ScanDataSource } from "@/context/types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface AppContextType {
  profile: UserProfile;
  scanHistory: ScanRecord[];
  scanDataSource: ScanDataSource;
  chatMessages: ChatMessage[];
  isLoading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addScan: (scan: ScanRecord) => void;
  loadDemoScanHistory: () => Promise<void>;
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
  latestScan: ScanRecord | null;
  previousScan: ScanRecord | null;
}

const defaultProfile: UserProfile = {
  name: "Alex Johnson",
  age: 28,
  height: 178,
  weight: 82,
  goal: "build_muscle",
  gender: "male",
  isPro: false,
  onboardingComplete: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);
  const [scanDataSource, setScanDataSource] = useState<ScanDataSource>("empty");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [storedProfile, storedScans, storedChats, storedSource] = await Promise.all([
        AsyncStorage.getItem("profile"),
        AsyncStorage.getItem("scanHistory"),
        AsyncStorage.getItem("chatMessages"),
        AsyncStorage.getItem("scanDataSource"),
      ]);

      if (storedProfile) setProfile(JSON.parse(storedProfile));

      if (storedScans) {
        setScanHistory(JSON.parse(storedScans));
        if (storedSource === "demo") setScanDataSource("demo");
        else if (storedSource === "live") setScanDataSource("live");
        else setScanDataSource("legacy_demo");
      } else {
        setScanHistory([]);
        setScanDataSource("empty");
      }

      if (storedChats) setChatMessages(JSON.parse(storedChats));
    } catch {
      setScanHistory([]);
      setScanDataSource("empty");
    } finally {
      setIsLoading(false);
    }
  }

  async function updateProfile(updates: Partial<UserProfile>) {
    const updated = { ...profile, ...updates };
    setProfile(updated);
    await AsyncStorage.setItem("profile", JSON.stringify(updated));
  }

  async function addScan(scan: ScanRecord) {
    setScanHistory((prev) => {
      const withoutDemo = prev.filter((p) => !p.id.startsWith("demo_"));
      const next = [scan, ...withoutDemo];
      void AsyncStorage.setItem("scanHistory", JSON.stringify(next));
      void AsyncStorage.setItem("scanDataSource", "live");
      return next;
    });
    setScanDataSource("live");
  }

  async function loadDemoScanHistory() {
    const demo = generateLabeledDemoScanHistory({
      height: profile.height,
      weight: profile.weight,
      gender: profile.gender,
    });
    setScanHistory(demo);
    setScanDataSource("demo");
    await AsyncStorage.setItem("scanHistory", JSON.stringify(demo));
    await AsyncStorage.setItem("scanDataSource", "demo");
  }

  async function addChatMessage(msg: ChatMessage) {
    setChatMessages((prev) => {
      const updated = [...prev, msg];
      void AsyncStorage.setItem("chatMessages", JSON.stringify(updated));
      return updated;
    });
  }

  async function clearChat() {
    setChatMessages([]);
    await AsyncStorage.removeItem("chatMessages");
  }

  const latestScan = scanHistory.length > 0 ? scanHistory[0] : null;
  const previousScan = scanHistory.length > 1 ? scanHistory[1] : null;

  return (
    <AppContext.Provider
      value={{
        profile,
        scanHistory,
        scanDataSource,
        chatMessages,
        isLoading,
        updateProfile,
        addScan,
        loadDemoScanHistory,
        addChatMessage,
        clearChat,
        latestScan,
        previousScan,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
