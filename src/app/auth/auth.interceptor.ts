import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';

// Adds Authorization header to outgoing requests when a token is available
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  
  // Solo acceder a localStorage en el browser
  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  // Leer token directamente del localStorage para evitar dependencia circular con AuthService
  const token = localStorage.getItem('parkcontrol_access_token');

  if (!token) {
    return next(req);
  }

  const authHeader = `Bearer ${token}`;
  const authorizedRequest = req.clone({
    setHeaders: {
      Authorization: authHeader,
    },
  });
  
  return next(authorizedRequest);
};
