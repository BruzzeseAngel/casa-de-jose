import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import RoomDetail from './pages/RoomDetail';
import Services from './pages/Services';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="habitaciones" element={<Rooms />} />
        <Route path="habitaciones/:id" element={<RoomDetail />} />
        <Route path="servicios" element={<Services />} />
        <Route path="*" element={<div className="container section"><h1>Página no encontrada</h1></div>} />
      </Route>
    </Routes>
  );
}
