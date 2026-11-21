import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import RoomDetail from './pages/RoomDetail';
import Services from './pages/Services';
import Quote from './pages/Quote';
import Access from './pages/Access';
import MyRequests from './pages/MyRequests';
import ClientArea from './pages/ClientArea';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="habitaciones" element={<Rooms />} />
        <Route path="habitaciones/:id" element={<RoomDetail />} />
        <Route path="servicios" element={<Services />} />
        <Route path="cotizar" element={<Quote />} />
        <Route path="acceso" element={<Access />} />
        <Route path="solicitudes-demo" element={<MyRequests />} />
        <Route path="mis-solicitudes" element={<ProtectedRoute><ClientArea /></ProtectedRoute>} />
        <Route path="*" element={<div className="container section"><h1>Página no encontrada</h1></div>} />
      </Route>
    </Routes>
  );
}
