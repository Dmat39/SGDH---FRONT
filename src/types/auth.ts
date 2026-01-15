import { SubgerenciaType } from "@/lib/constants";

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  permissions: string[];
  subgerencia: SubgerenciaType;
  cargo?: string;
  avatar?: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  isLogin: boolean;
  moduleLoading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
  subgerencia: SubgerenciaType;
}

export interface LoginResponse {
  token: string;
  user: User;
}
