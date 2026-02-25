import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';

import { Login } from './pages/Login';
import { DashboardLayout } from './components/Layout/DashboardLayout';

import { ItemsList } from './pages/items/ItemsList';
import { NutsList } from './pages/nuts/NutsList';
import { OccasionsList } from './pages/occasions/OccasionsList';
import { BannersList } from './pages/banners/BannersList';
import { MappingsList } from './pages/mappings/MappingsList';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/items" replace />} />
            <Route path="items" element={<ItemsList />} />
            <Route path="nuts" element={<NutsList />} />
            <Route path="occasions" element={<OccasionsList />} />
            <Route path="mappings" element={<MappingsList />} />
            <Route path="banners" element={<BannersList />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
