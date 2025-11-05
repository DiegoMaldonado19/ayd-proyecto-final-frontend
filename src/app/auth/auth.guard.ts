import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  // Esperar a que termine la inicialización del AuthService
  await auth.waitForInitialization();
  
  // Ahora verificar si está autenticado
  if (auth.isAuthenticated()) {
    return true;
  }
  
  // Guardar URL intentada para redirigir después del login
  router.navigate(['/login'], { 
    queryParams: { returnUrl: state.url }
  });
  return false;
};
