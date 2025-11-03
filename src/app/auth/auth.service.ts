import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { API_BASE } from '../api.config';
import { firstValueFrom } from 'rxjs';

// ==================== DTOs según backend ====================
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user_id: number;
  email: string;
  full_name: string;
  role: string;
  has_2fa_enabled: boolean;
  requires_2fa_verification: boolean;
  requires_password_change: boolean;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface Verify2FARequest {
  code: string;
  temp_token: string;
}

export interface TwoFAResponse {
  qr_code?: string;
  secret?: string;
  enabled: boolean;
  message: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface UserProfileResponse {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  has_2fa_enabled: boolean;
  is_active: boolean;
  last_login: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private isBrowser = isPlatformBrowser(this.platformId);
  
  // Storage keys
  private readonly TOKEN_KEY = 'parkcontrol_access_token';
  private readonly REFRESH_TOKEN_KEY = 'parkcontrol_refresh_token';
  private readonly USER_KEY = 'parkcontrol_user';

  // Signals
  public isAuthenticated = signal<boolean>(this.isBrowser ? !!this.getToken() : false);
  public currentUser = signal<LoginResponse | null>(this.isBrowser ? this.loadUser() : null);

  constructor() {
    // Cargar usuario al iniciar si hay token
    if (this.isBrowser && this.getToken()) {
      this.loadProfile().catch((error) => {
        if (error instanceof HttpErrorResponse && [401, 403].includes(error.status)) {
          this.clearAuth();
          return;
        }
        console.error('Error al recuperar la sesión', error);
      });
    }
  }

  // ==================== Storage helpers ====================
  private getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getRefreshToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private loadUser(): LoginResponse | null {
    if (!this.isBrowser) return null;
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private saveAuth(response: LoginResponse) {
    if (!this.isBrowser) return;
    localStorage.setItem(this.TOKEN_KEY, response.access_token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refresh_token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response));
    this.isAuthenticated.set(true);
    this.currentUser.set(response);
  }

  private clearAuth() {
    if (!this.isBrowser) return;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
  }

  // ==================== Public API ====================
  
  /**
   * Obtiene el token de acceso para los interceptores
   */
  getAccessToken(): string | null {
    return this.getToken();
  }

  /**
   * Login con email y password
   * POST /auth/login
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const request: LoginRequest = { email, password };
    const response = await firstValueFrom(
      this.http.post<LoginResponse>(`${API_BASE}/auth/login`, request)
    );

    // Si requiere 2FA, no guardar tokens todavía
    if (response.requires_2fa_verification) {
      return response;
    }

    // Si requiere cambio de contraseña, guardar para poder cambiarla
    if (response.requires_password_change) {
      this.saveAuth(response);
      return response;
    }

    // Login exitoso completo
    this.saveAuth(response);
    return response;
  }

  /**
   * Verificar código 2FA
   * POST /auth/2fa/verify
   */
  async verify2FA(code: string, tempToken: string): Promise<LoginResponse> {
    const request: Verify2FARequest = { code, temp_token: tempToken };
    const response = await firstValueFrom(
      this.http.post<LoginResponse>(`${API_BASE}/auth/2fa/verify`, request)
    );
    this.saveAuth(response);
    return response;
  }

  /**
   * Logout
   * POST /auth/logout
   */
  async logout(): Promise<void> {
    try {
      // Llamar endpoint de logout si hay token
      if (this.getToken()) {
        await firstValueFrom(
          this.http.post<ApiResponse<void>>(`${API_BASE}/auth/logout`, {})
        );
      }
    } catch (error) {
      console.error('Error al hacer logout en backend:', error);
    } finally {
      this.clearAuth();
    }
  }

  /**
   * Refrescar token
   * POST /auth/refresh
   */
  async refreshAccessToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No hay refresh token disponible');
    }

    const request: RefreshTokenRequest = { refresh_token: refreshToken };
    const response = await firstValueFrom(
      this.http.post<TokenResponse>(`${API_BASE}/auth/refresh`, request)
    );

    // Actualizar tokens
    if (this.isBrowser) {
      localStorage.setItem(this.TOKEN_KEY, response.access_token);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refresh_token);
    }

    return response.access_token;
  }

  /**
   * Obtener perfil del usuario
   * GET /auth/profile
   */
  async loadProfile(): Promise<UserProfileResponse> {
    const profile = await firstValueFrom(
      this.http.get<UserProfileResponse>(`${API_BASE}/auth/profile`)
    );
    
    // Actualizar información en currentUser
    if (this.currentUser()) {
      const current = this.currentUser()!;
      const updated = {
        ...current,
        email: profile.email,
        full_name: `${profile.first_name} ${profile.last_name}`,
        role: profile.role,
        has_2fa_enabled: profile.has_2fa_enabled
      };
      this.currentUser.set(updated);
      if (this.isBrowser) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(updated));
      }
    }
    
    return profile;
  }

  /**
   * Habilitar 2FA
   * POST /auth/2fa/enable
   */
  async enable2FA(): Promise<TwoFAResponse> {
    return await firstValueFrom(
      this.http.post<TwoFAResponse>(`${API_BASE}/auth/2fa/enable`, {})
    );
  }

  /**
   * Deshabilitar 2FA
   * POST /auth/2fa/disable
   */
  async disable2FA(): Promise<TwoFAResponse> {
    return await firstValueFrom(
      this.http.post<TwoFAResponse>(`${API_BASE}/auth/2fa/disable`, {})
    );
  }

  /**
   * Solicitar reset de contraseña
   * POST /auth/password/reset
   */
  async resetPassword(email: string): Promise<void> {
    const request: ResetPasswordRequest = { email };
    await firstValueFrom(
      this.http.post<ApiResponse<void>>(`${API_BASE}/auth/password/reset`, request)
    );
  }

  /**
   * Cambiar contraseña
   * POST /auth/password/change
   */
  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
    const request: ChangePasswordRequest = {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword
    };
    await firstValueFrom(
      this.http.post<ApiResponse<void>>(`${API_BASE}/auth/password/change`, request)
    );
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.role === role;
  }

  /**
   * Verificar si el usuario tiene alguno de los roles especificados
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUser();
    return user ? roles.includes(user.role) : false;
  }
}
