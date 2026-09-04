export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Interaction {
  id: string;
  userId: string;
  title: string;
  summary?: string;
  actionItems?: string[];
  themes?: string[];
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
}
