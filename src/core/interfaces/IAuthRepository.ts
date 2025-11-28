// core/interfaces/IAuthRepository.ts
import { DriverInterface } from '@/interfaces/IDriver';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  driver: DriverInterface; // 🔹 MUDAR de user para driver
  token?: string;
}

export interface IAuthRepository {
  // Autenticação
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  register(driverData: RegisterData): Promise<AuthResponse>;
  logout(): Promise<void>;

  // Estado da autenticação
  getCurrentDriver(): Promise<DriverInterface | null>;
  isAuthenticated(): Promise<boolean>;

  // Recuperação de senha
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;

  // Verificação por email
  sendEmailVerification(): Promise<void>;
  checkEmailVerification(): Promise<boolean>;
  reloadDriver(): Promise<void>; // 🔹 MUDAR de reloadUser para reloadDriver

  getDriverById(driverId: string): Promise<DriverInterface | null>;
}
