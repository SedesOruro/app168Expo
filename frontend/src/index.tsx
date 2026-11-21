import React from 'react';
import ReactDOM from 'react-dom/client';
import { SnackbarProvider } from 'notistack';
import { BrowserRouter } from 'react-router';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { EmergencyFlowProvider } from './context/EmergencyFlowContext';
import { QueryProvider } from './context/QueryProvider';
import { SocketProvider } from './context/SocketContext';
import ThemeProvider from './theme';
// Se importa al arrancar para no perder `beforeinstallprompt`, que llega antes que
// el inicio (pagina diferida).
import './hooks/useInstalarPwa';

// El service worker se actualiza solo: una PWA de emergencias no debe quedarse
// en una version vieja esperando a que alguien pulse "actualizar".
registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <SnackbarProvider maxSnack={3} preventDuplicate anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <QueryProvider>
          <AuthProvider>
            <EmergencyFlowProvider>
              <SocketProvider>
                <BrowserRouter>
                  <App />
                </BrowserRouter>
              </SocketProvider>
            </EmergencyFlowProvider>
          </AuthProvider>
        </QueryProvider>
      </SnackbarProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
