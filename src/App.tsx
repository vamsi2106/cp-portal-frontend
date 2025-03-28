import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { ConfigProvider, Spin } from 'antd';
import { store } from './redux/store';
import MainLayout from './components/Layout/MainLayout';
import OTPLogin from './components/Auth/OTPLogin';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Partners from './pages/Partners';
import Leads from './pages/Leads';
import { onAuthStateChanged } from 'firebase/auth';
import { login, logout } from './redux/slices/authSlice';
import { auth } from './config/firebase';
import ProfileDetails from './pages/Profile/ProfileDetails';

const AppContent: React.FC = () => {
  const dispatch: any = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
      if (user) {
        const token = await user.getIdToken();
        const phoneNumber = user.phoneNumber?.replace(/^\+91/, '') || '';
        await dispatch(login({ phoneNumber, token }));
      } else {
        dispatch(logout());
      }
      setLoading(false);  // Only after checking auth, stop loading
    });

    return () => unsubscribe();
  }, [dispatch]);

  if (loading) {
    // AntD spinner with Tailwind CSS perfectly centered
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spin tip="Loading..." size="large" />
      </div>
    );
  }

  // Once auth check finishes, app routes render without glitch
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<OTPLogin />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfileDetails />} />
          <Route path="partners" element={<Partners />} />
          <Route path="leads" element={<Leads />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

const App: React.FC = () => (
  <Provider store={store}>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#DAA520',
          borderRadius: 8,
          colorBgContainer: '#FFFFFF',
          colorBorder: '#F4D03F',
          colorTextBase: '#333333',
        },
      }}
    >
      <AppContent />
    </ConfigProvider>
  </Provider>
);

export default App;
