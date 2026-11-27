import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import RoomDetail from './pages/RoomDetail';
import Services from './pages/Services';
import Quote from './pages/Quote';
import Access from './pages/Access';
import MyRequests from './pages/MyRequests';
import Admin from './pages/Admin';
// React Router organiza la navegación pública y privada en un único mapa de rutas.
// ProtectedRoute controla el acceso visual; Firebase autoriza las operaciones sobre datos.
export default function App() {
  return <Routes>
    <Route element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="habitaciones" element={<Rooms />} />
      <Route path="habitaciones/:id" element={<RoomDetail />} />
      <Route path="servicios" element={<Services />} />
      <Route path="cotizar" element={<Quote />} />
      <Route path="acceso" element={<Access />} />
      <Route path="mis-solicitudes" element={<ProtectedRoute>
        <MyRequests />
      </ProtectedRoute>} />
      <Route path="admin" element={<ProtectedRoute soloAdmin>
        <Admin />
      </ProtectedRoute>} />
      <Route path="*" element={<main className="container section">
        <h1>Página no encontrada</h1>
      </main>} />
    </Route>
  </Routes>;
}
