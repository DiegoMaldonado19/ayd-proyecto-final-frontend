import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../../shared/services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notification = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        switch (error.status) {
          case 400:
            errorMessage = error.error?.message || 'Solicitud inválida';
            break;
          case 401:
            errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente';
            // Clear token and redirect to login
            if (typeof window !== 'undefined') {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user');
            }
            router.navigate(['/login']);
            break;
          case 403:
            errorMessage = 'No tienes permisos para realizar esta acción';
            break;
          case 404:
            errorMessage = error.error?.message || 'Recurso no encontrado';
            break;
          case 429:
            errorMessage = 'Demasiadas solicitudes. Por favor, intenta más tarde';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Intenta más tarde';
            break;
          case 503:
            errorMessage = 'Servicio no disponible temporalmente';
            break;
          default:
            errorMessage = error.error?.message || `Error del servidor (${error.status})`;
        }
      }

      // Show error toast notification
      notification.error(errorMessage);

      return throwError(() => error);
    })
  );
};
