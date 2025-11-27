import { createContext } from 'react';

interface User {
  _id: string;
  username: string;
  email: string;
  subscription: {
    tier: string;
    startDate: string;
    endDate: string;
  };
  usageStats: {
    componentsGenerated: number;
    projectsCreated: number;
  };
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
