import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingLayout from './layouts/LandingLayout';
import DashboardLayout from './layouts/DashboardLayout';
import HomeView from './views/HomeView';
import DashboardHome from './views/dashboard/DashboardHome';
import ProduccionDiariaView from './views/dashboard/ProduccionDiariaView';
import MorbilidadView from './views/dashboard/MorbilidadView';
import MortalidadView from './views/dashboard/MortalidadView';
import RegistroClasificacionView from './views/dashboard/RegistroClasificacionView';
import NotificacionesView from './views/dashboard/NotificacionesView';
import TratamientoView from './views/dashboard/TratamientoView';
import UserManagementView from './views/users/UserManagementView';
import RegisterUserView from './views/users/RegisterUserView';
import UserProfileView from './views/users/UserProfileView';
import LoginView from './views/auth/LoginView';
import RegisterView from './views/auth/RegisterView';
import ForgotPasswordView from './views/auth/ForgotPasswordView';
import ReportesDiarioView from './views/reportes/ReportesDiarioView';
import ReportesAlimentoView from './views/reportes/ReportesAlimentoView';
import ReportesMortalidadView from './views/reportes/ReportesMortalidadView';
import ReportesFinanzasView from './views/reportes/ReportesFinanzasView';
import GestionUsuariosView from './views/dashboard/GestionUsuariosView';
import DashboardProduccion from './views/dashboard/DashboardProduccion';
import ConfiguracionGeneral from './views/dashboard/ConfiguracionGeneral';
import AdminGalponesView from './views/galpones/AdminGalponesView';
import FinanzasView from './views/dashboard/Finanzasview';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Layout Routes */}
        <Route element={<LandingLayout />}>
          <Route path="/" element={<HomeView />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/loginview" element={<LoginView />} />
        <Route path="/register" element={<RegisterView />} />
        <Route path="/forgot-password" element={<ForgotPasswordView />} />

        {/* Dashboard Layout Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/prodfunfinal" element={<DashboardProduccion/>} />
          <Route path="/morbilidad" element={<MorbilidadView />} />
          <Route path="/mortalidad" element={<MortalidadView />} />
          <Route path="/tratamiento" element={<TratamientoView />} />
          <Route path="/registro_clasificacion" element={<RegistroClasificacionView />} />
          <Route path="/finanzas" element={<FinanzasView />} />
          <Route path="/notificaciones" element={<NotificacionesView />} />
          <Route path="/users" element={<GestionUsuariosView />} />
          <Route path="/galpones" element={<AdminGalponesView />} />
          <Route path="/lotes" element={<AdminGalponesView />} />
          <Route path="/users/register" element={<RegisterUserView />} />
          <Route path="/profile" element={<UserProfileView />} />
          <Route path="/rep_diario" element={<ReportesDiarioView />} />
          <Route path="/reportes" element={<ReportesAlimentoView />} />
          <Route path="/configuracion" element={<ConfiguracionGeneral />} />
        </Route>


        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
