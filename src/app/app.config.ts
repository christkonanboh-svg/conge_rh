import { ApplicationConfig, APP_INITIALIZER, inject } from '@angular/core';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';
import { LeaveSeedService } from './core/leave-requests/leave-seed.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideCharts(withDefaultRegisterables()),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const auth = inject(AuthService);
        const leaveSeed = inject(LeaveSeedService);
        return async () => {
          await auth.seedDemoAccounts();
          leaveSeed.seedDemoData();
        };
      },
    },
  ],
};
