import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

import Navbar from './components/common/Navbar';
import Chatbot from './components/common/Chatbot';

import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VillageList from './pages/tourist/VillageList';
import VillageDetail from './pages/tourist/VillageDetail';
import BookingPage from './pages/tourist/BookingPage';
import MyBookings from './pages/tourist/MyBookings';
import Marketplace from './pages/tourist/Marketplace';
import RouteFinder from './pages/tourist/RouteFinder';
import HostDashboard from './pages/host/HostDashboard';
import HostVillages from './pages/host/HostVillages';
import AddVillage from './pages/host/AddVillage';
import EditVillage from './pages/host/EditVillage';
import HostBookings from './pages/host/HostBookings';
import HostMarketplace from './pages/host/HostMarketplace';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVillages from './pages/admin/AdminVillages';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user } = useAuthStore();
  if (user) {
    if (user.role === 'host') return <Navigate to="/host" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/villages" replace />;
  }
  return children;
};

export default function App() {
  const { user } = useAuthStore();
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/villages" element={<VillageList />} />
        <Route path="/villages/:id" element={<VillageDetail />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/route-finder" element={<RouteFinder />} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/book/:villageId" element={<ProtectedRoute roles={['tourist']}><BookingPage /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute roles={['tourist']}><MyBookings /></ProtectedRoute>} />
        <Route path="/host" element={<ProtectedRoute roles={['host']}><HostDashboard /></ProtectedRoute>} />
        <Route path="/host/villages" element={<ProtectedRoute roles={['host']}><HostVillages /></ProtectedRoute>} />
        <Route path="/host/villages/add" element={<ProtectedRoute roles={['host']}><AddVillage /></ProtectedRoute>} />
        <Route path="/host/villages/edit/:id" element={<ProtectedRoute roles={['host']}><EditVillage /></ProtectedRoute>} />
        <Route path="/host/bookings" element={<ProtectedRoute roles={['host']}><HostBookings /></ProtectedRoute>} />
        <Route path="/host/marketplace" element={<ProtectedRoute roles={['host']}><HostMarketplace /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/villages" element={<ProtectedRoute roles={['admin']}><AdminVillages /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {user && <Chatbot />}
    </BrowserRouter>
  );
}
