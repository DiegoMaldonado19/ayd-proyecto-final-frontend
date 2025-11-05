import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Guard que verifica si el usuario necesita cambiar su contraseña
 * Si requires_password_change es true, redirige a /change-password
 * Permite acceso a /change-password sin restricción
 */
export const passwordChangeGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const user = authService.currentUser();
  
  // Si no hay usuario, dejar que authGuard se encargue
  if (!user) {
    return true;
  }
  
  // Si el usuario requiere cambio de contraseña
  if (user.requires_password_change) {
    // Permitir acceso a la página de cambio de contraseña
    if (state.url.includes('/change-password')) {
      return true;
    }
    
    // Redirigir a cambio de contraseña si intenta acceder a otra ruta
    console.log('passwordChangeGuard: Usuario requiere cambio de contraseña, redirigiendo...');
    return router.createUrlTree(['/change-password']);
  }
  
  // Usuario no requiere cambio de contraseña, permitir navegación
  return true;
};
