import React, { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { ConfigProvider, Spin } from "antd";
import { store } from "./redux/store";
import MainLayout from "./components/Layout/MainLayout";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import { onAuthStateChanged } from "firebase/auth";
import { login, logout } from "./redux/slices/authSlice";
import { auth } from "./config/firebase";

// Lazy load components
const OTPLogin = lazy(() => import("./components/Auth/OTPLogin"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Partners = lazy(() => import("./pages/Partners"));
const Leads = lazy(() => import("./pages/Leads"));
const Contacts = lazy(() => import("./pages/Contacts"));
const Brochures = lazy(() => import("./components/Brochures/Brochures"));
const ProfileDetails = lazy(() => import("./pages/Profile/ProfileDetails"));

// Loading component for suspense fallback
const LoadingComponent = ({ tip = "Loading..." }: { tip?: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <Spin tip={tip} size="large" />
  </div>
);

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
    return <LoadingComponent tip="Authenticating..." />;
  }

  // Once auth check finishes, app routes render without glitch
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <Suspense fallback={<LoadingComponent tip="Loading login..." />}>
              <OTPLogin />
            </Suspense>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route
            path="dashboard"
            element={
              <Suspense fallback={<LoadingComponent tip="Loading dashboard..." />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="/profile"
            element={
              <Suspense fallback={<LoadingComponent tip="Loading profile..." />}>
                <ProfileDetails />
              </Suspense>
            }
          />
          <Route
            path="partners"
            element={
              <Suspense fallback={<LoadingComponent tip="Loading partners..." />}>
                <Partners />
              </Suspense>
            }
          />
          <Route
            path="leads"
            element={
              <Suspense fallback={<LoadingComponent tip="Loading leads..." />}>
                <Leads />
              </Suspense>
            }
          />
          <Route
            path="contacts"
            element={
              <Suspense fallback={<LoadingComponent tip="Loading contacts..." />}>
                <Contacts />
              </Suspense>
            }
          />
          <Route
            path="brochures"
            element={
              <Suspense fallback={<LoadingComponent tip="Loading brochures..." />}>
                <Brochures />
              </Suspense>
            }
          />
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
