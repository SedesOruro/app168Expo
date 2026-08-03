import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";
import { useAuth } from "./context/AuthContext";

const DashboardLayout = lazy(() => import("./layouts/dashboard").then((module) => ({ default: module.DashboardLayout })));
const DashboardPage = lazy(() => import("./pages/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const LoginPage = lazy(() => import("./pages/LoginPage").then((module) => ({ default: module.LoginPage })));
const Page404 = lazy(() => import("./pages/Page404").then((module) => ({ default: module.Page404 })));
const PerfilPage = lazy(() => import("./pages/PerfilPage").then((module) => ({ default: module.PerfilPage })));
const RolesPage = lazy(() => import("./pages/system/RolesPage").then((module) => ({ default: module.RolesPage })));
const SeguridadPage = lazy(() => import("./pages/system/SeguridadPage").then((module) => ({ default: module.SeguridadPage })));
const UsuariosPage = lazy(() => import("./pages/system/UsuariosPage").then((module) => ({ default: module.UsuariosPage })));
const EmergenciasPage = lazy(() => import("./pages/operations/EmergenciasPage").then((module) => ({ default: module.EmergenciasPage })));
const CiudadanosPage = lazy(() => import("./pages/operations/CiudadanosPage").then((module) => ({ default: module.CiudadanosPage })));
const CentrosSaludPage = lazy(() => import("./pages/operations/CentrosSaludPage").then((module) => ({ default: module.CentrosSaludPage })));

const ProtectedRoute = () => {
  const { authenticated } = useAuth();
  return authenticated ? <DashboardLayout /> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Suspense fallback={<div role="status">Cargando…</div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route index element={<DashboardPage />} />
          <Route path="usuarios" element={<UsuariosPage />} />
          <Route path="emergencias" element={<EmergenciasPage />} />
          <Route path="ciudadanos" element={<CiudadanosPage />} />
          <Route path="centros-salud" element={<CentrosSaludPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="perfil" element={<PerfilPage />} />
          <Route path="seguridad" element={<SeguridadPage />} />
          <Route path="404" element={<Page404 />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
