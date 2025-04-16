// Navigation types
export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Lists: undefined;
  CreateList: undefined;
  AddWord: { listId: string };
  ListDetail: { listId: string; highlightWordId?: string };
  Search: undefined;
  Settings: undefined;
  Learn: { listId: string };
  Quiz: { listId: string };
  FeaturePlaceholder: { featureId: number; featureName: string; description: string };
};

// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}

// Auth types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Word List types
export interface WordList {
  id: string;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
  word_count: number;
  progress: number;
}

// Word types
export interface Word {
  id: string;
  list_id: string;
  original: string;
  translation: string;
  context?: string;
  notes?: string;
  created_at: string;
  mastery_level: number;
}
