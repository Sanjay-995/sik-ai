import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BodyMeasurement {
  chest: number;
  waist: number;
  hips: number;
  leftArm: number;
  rightArm: number;
  leftThigh: number;
  rightThigh: number;
  neck: number;
  shoulders: number;
  bodyFat: number;
  muscleMass: number;
}

export interface ScanRecord {
  id: string;
  date: string;
  measurements: BodyMeasurement;
  weight: number;
  bmi: number;
  score: number;
  notes?: string;
}

export interface UserProfile {
  name: string;
  age: number;
  height: number;
  weight: number;
  goal: 'lose_weight' | 'build_muscle' | 'maintain' | 'improve_fitness';
  gender: 'male' | 'female';
  isPro: boolean;
  onboardingComplete: boolean;
  units?: 'metric' | 'imperial';
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AppContextType {
  profile: UserProfile;
  scanHistory: ScanRecord[];
  chatMessages: ChatMessage[];
  isLoading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addScan: (scan: ScanRecord) => void;
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
  latestScan: ScanRecord | null;
  previousScan: ScanRecord | null;
}

const defaultProfile: UserProfile = {
  name: 'Alex Johnson',
  age: 28,
  height: 178,
  weight: 82,
  goal: 'build_muscle',
  gender: 'male',
  isPro: false,
  onboardingComplete: false,
};

function generateMockData(): ScanRecord[] {
  const records: ScanRecord[] = [];
  const now = new Date();

  const baseMetrics = {
    chest: 98,
    waist: 84,
    hips: 97,
    leftArm: 35,
    rightArm: 35.5,
    leftThigh: 58,
    rightThigh: 57.5,
    neck: 38,
    shoulders: 122,
    bodyFat: 18.5,
    muscleMass: 41,
  };

  for (let i = 7; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 7);
    const progress = (7 - i) / 7;
    const jitter = () => (Math.random() - 0.5) * 0.4;

    const measurements: BodyMeasurement = {
      chest: baseMetrics.chest - progress * 0.5 + jitter(),
      waist: baseMetrics.waist - progress * 2.5 + jitter(),
      hips: baseMetrics.hips - progress * 1.2 + jitter(),
      leftArm: baseMetrics.leftArm + progress * 1.5 + jitter(),
      rightArm: baseMetrics.rightArm + progress * 1.5 + jitter(),
      leftThigh: baseMetrics.leftThigh + progress * 1 + jitter(),
      rightThigh: baseMetrics.rightThigh + progress * 1 + jitter(),
      neck: baseMetrics.neck + progress * 0.3 + jitter(),
      shoulders: baseMetrics.shoulders + progress * 1.5 + jitter(),
      bodyFat: baseMetrics.bodyFat - progress * 2.5 + jitter(),
      muscleMass: baseMetrics.muscleMass + progress * 2 + jitter(),
    };

    const weight = 82 - progress * 3 + jitter();
    const height = 178;
    const bmi = parseFloat((weight / Math.pow(height / 100, 2)).toFixed(1));
    const score = Math.round(65 + progress * 20 + Math.random() * 5);

    records.push({
      id: `scan_${i}`,
      date: date.toISOString(),
      measurements,
      weight: parseFloat(weight.toFixed(1)),
      bmi,
      score,
      notes: i === 0 ? 'Latest scan' : undefined,
    });
  }

  return records;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatMessagesRef = useRef<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    chatMessagesRef.current = chatMessages;
  }, [chatMessages]);

  async function loadData() {
    try {
      const [storedProfile, storedScans, storedChats] = await Promise.all([
        AsyncStorage.getItem('profile'),
        AsyncStorage.getItem('scanHistory'),
        AsyncStorage.getItem('chatMessages'),
      ]);

      if (storedProfile) setProfile(JSON.parse(storedProfile));
      if (storedScans) {
        setScanHistory(JSON.parse(storedScans));
      } else {
        const mockData = generateMockData();
        setScanHistory(mockData);
        await AsyncStorage.setItem('scanHistory', JSON.stringify(mockData));
      }
      if (storedChats) setChatMessages(JSON.parse(storedChats));
    } catch (e) {
      const mockData = generateMockData();
      setScanHistory(mockData);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateProfile(updates: Partial<UserProfile>) {
    const updated = { ...profile, ...updates };
    setProfile(updated);
    await AsyncStorage.setItem('profile', JSON.stringify(updated));
  }

  async function addScan(scan: ScanRecord) {
    const updated = [scan, ...scanHistory];
    setScanHistory(updated);
    await AsyncStorage.setItem('scanHistory', JSON.stringify(updated));
  }

  async function addChatMessage(msg: ChatMessage) {
    const updated = [...chatMessagesRef.current, msg];
    chatMessagesRef.current = updated;
    setChatMessages(updated);
    await AsyncStorage.setItem('chatMessages', JSON.stringify(updated));
  }

  async function clearChat() {
    setChatMessages([]);
    await AsyncStorage.removeItem('chatMessages');
  }

  const latestScan = scanHistory.length > 0 ? scanHistory[0] : null;
  const previousScan = scanHistory.length > 1 ? scanHistory[1] : null;

  return (
    <AppContext.Provider value={{
      profile,
      scanHistory,
      chatMessages,
      isLoading,
      updateProfile,
      addScan,
      addChatMessage,
      clearChat,
      latestScan,
      previousScan,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
