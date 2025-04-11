import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { ConfigProvider, Spin } from "antd";
import { store } from "./redux/store";
import MainLayout from "./components/Layout/MainLayout";
import OTPLogin from "./components/Auth/OTPLogin";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Partners from "./pages/Partners";
import Leads from "./pages/Leads";
import Contacts from "./pages/Contacts";
import { onAuthStateChanged } from "firebase/auth";
import { login, logout } from "./redux/slices/authSlice";
import { auth } from "./config/firebase";
import ProfileDetails from "./pages/Profile/ProfileDetails";

const AppContent: React.FC = () => {
  const dispatch: any = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const token = await user.getIdToken();
          const phoneNumber = user.phoneNumber?.replace(/^\+91/, "") || "";
          await dispatch(login({ phoneNumber, token }));
        } else {
          dispatch(logout());
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false); // Always stop loading, regardless of outcome
      }
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
          <Route path="contacts" element={<Contacts />} />
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
          colorPrimary: "#cca95a",
          borderRadius: 8,
          colorBgContainer: "#FFFFFF",
          colorBorder: "#cca95a",
          colorTextBase: "#132430",
          colorBgLayout: "#f6f4ef",
          colorBgElevated: "#FFFFFF",
          colorBgMask: "rgba(204, 169, 90, 0.1)",
          colorPrimaryHover: "#b89948",
          colorPrimaryActive: "#b89948",
          colorPrimaryBg: "#f6f4ef",
          colorPrimaryBgHover: "#ede9df",
          colorPrimaryBorder: "#cca95a",
          colorPrimaryBorderHover: "#b89948",
          colorPrimaryText: "#cca95a",
          colorPrimaryTextHover: "#b89948",
          colorPrimaryTextActive: "#b89948",
        },
      }}
    >
      <AppContent />
    </ConfigProvider>
  </Provider>
);

export default App;
