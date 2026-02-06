import { createContext } from "react";

type UserRole = 'doctor' | 'patient' | 'third-party' | null;

export const AuthContext = createContext({
  isAuthenticated: false,
  role: null as UserRole,
  setAuthenticated: (value: boolean, role: UserRole) => {},
  logout: () => {},
});