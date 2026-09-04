export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface JournalLocation {
  lat: number;
  lng: number;
  placeName: string;
  formattedAddress?: string;
}

export interface Interaction {
  id: string;
  userId: string;
  title: string;
  summary?: string;
  actionItems?: string[];
  themes?: string[];
  location?: JournalLocation;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export type ReflectionMode = 'general' | 'brainstorm' | 'summary' | 'coaching';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin?: boolean;
}

export interface SystemTelemetry {
  totalReflectionsTracked: number;
  totalSynthesizedSessions: number;
  totalLocationsPinned: number;
  activeUsersCount: number;
  lastUpdated: number;
  modelFleetStatus: {
    primary: string;
    fallbacks: string[];
    geminiHealth: 'healthy' | 'degraded' | 'offline';
  };
  recentActivityLogs: {
    id: string;
    timestamp: number;
    action: string;
    anonymizedUserHash: string;
    mode: string;
  }[];
}
