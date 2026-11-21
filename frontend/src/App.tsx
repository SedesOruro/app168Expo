import type React from "react";
import { lazy, Suspense, useCallback, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { Cargando } from './components/Cargando';
import { rutas } from './constants/rutas';
import { useAuth } from './context/AuthContext';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pagina = <K extends string, P = any>(cargar: () => Promise<Record<K, React.ComponentType<P>>>, nombre: K) =>
  lazy(() => cargar().then((m) => ({ default: m[nombre] })));

const PresentacionPage = pagina(() => import('./pages/onboarding/PresentacionPage'), 'PresentacionPage');
const LoginPage = pagina(() => import('./pages/auth/LoginPage'), 'LoginPage');
const RegistroPage = pagina(() => import('./pages/auth/RegistroPage'), 'RegistroPage');
const DashboardPage = pagina(() => import('./pages/DashboardPage'), 'DashboardPage');
const TriajePage = pagina(() => import('./pages/emergencia/TriajePage'), 'TriajePage');
const SeguimientoPage = pagina(() => import('./pages/emergencia/SeguimientoPage'), 'SeguimientoPage');
const EvidenciasPage = pagina(() => import('./pages/emergencia/EvidenciasPage'), 'EvidenciasPage');
const CentrosSaludPage = pagina(() => import('./pages/CentrosSaludPage'), 'CentrosSaludPage');
const HistorialPage = pagina(() => import('./pages/HistorialPage'), 'HistorialPage');
const InformacionPage = pagina(() => import('./pages/InformacionPage'), 'InformacionPage');
const PerfilPage = pagina(() => import('./pages/perfil/PerfilPage'), 'PerfilPage');
const PerfilEditarPage = pagina(() => import('./pages/perfil/PerfilEditarPage'), 'PerfilEditarPage');
const CambiarContrasenaPage = pagina(() => import('./pages/perfil/CambiarContrasenaPage'), 'CambiarContrasenaPage');

/**
 * Equivalente de RootNavigator: presentacion al abrir, luego la app si hay sesion
 * (o se salto el registro) y si no, registro/login.
 */
export default function App() {
  const { status, explorando } = useAuth();
  const [presentacionVista, setPresentacionVista] = useState(false);
  const terminarPresentacion = useCallback(() => setPresentacionVista(true), []);

  if (!presentacionVista) {
    return (
      <Suspense fallback={<Cargando />}>
        <PresentacionPage onTerminar={terminarPresentacion} />
      </Suspense>
    );
  }

  if (status === 'checking') return <Cargando />;

  // Quien salto el registro entra como visitante. El boton de emergencia le
  // pedira registrarse cuando lo pulse, no antes.
  const puedeEntrar = status === 'authenticated' || explorando;

  return (
    <Suspense fallback={<Cargando />}>
      {puedeEntrar ? (
        <Routes>
          <Route path={rutas.inicio} element={<DashboardPage />} />
          <Route path={rutas.triaje} element={<TriajePage />} />
          <Route path={rutas.seguimiento} element={<SeguimientoPage />} />
          <Route path={`${rutas.seguimiento}/:uuid`} element={<SeguimientoPage />} />
          <Route path={rutas.evidencias} element={<EvidenciasPage />} />
          <Route path={`${rutas.evidencias}/:uuid`} element={<EvidenciasPage />} />
          <Route path={rutas.centrosSalud} element={<CentrosSaludPage />} />
          <Route path={rutas.historial} element={<HistorialPage />} />
          <Route path={rutas.informacion} element={<InformacionPage />} />
          <Route path={rutas.perfil} element={<PerfilPage />} />
          <Route path={rutas.perfilEditar} element={<PerfilEditarPage />} />
          <Route path={rutas.cambiarContrasena} element={<CambiarContrasenaPage />} />
          <Route path="*" element={<Navigate to={rutas.inicio} replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route path={rutas.registro} element={<RegistroPage />} />
          <Route path={rutas.login} element={<LoginPage />} />
          <Route path="*" element={<Navigate to={rutas.registro} replace />} />
        </Routes>
      )}
    </Suspense>
  );
}
