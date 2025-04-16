// Navigation Types
export type RootStackParamList = {
  Home: undefined;
  FeaturePlaceholder: {
    featureId: number;
    featureName: string;
    description: string
  };
  // These would be implemented by the team
  Login: undefined;
  Register: undefined;
  Lists: undefined;
  CreateList: undefined;
  ListDetail: { listId: string };
  AddWord: { listId: string };
  Learn: { listId: string };
  Quiz: { listId: string };
  Progress: undefined;
  Search: undefined;
  Settings: undefined;
  // Innovative features
  Translator: undefined;
};

// Data Types
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface WordList {
  id: string;
  name: string;
  description: string;
  context?: string;
  createdAt: string;
  wordCount?: number;
}

export interface Word {
  id: string;
  listId: string;
  value: string;
  meaning: string;
  createdAt: string;
}

export interface Exercise {
  wordId: string;
  type: 'multiple_choice';
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Quiz {
  wordId: string;
  type: 'quiz';
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Progress {
  listId: string;
  wordId: string;
  mastery: number; // 0-100
  lastPracticed: string;
  timesCorrect: number;
  timesIncorrect: number;
}

// Auth Context Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextProps {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}
