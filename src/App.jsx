// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './hooks/useAuth';

// Layout Components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import MobileNav from './components/layout/MobileNav';

// Pages
import Dashboard from './pages/Dashboard';
import FoodLog from './pages/FoodLog';
import Exercise from './pages/Exercise';
import NutritionAnalysis from './pages/NutritionAnalysis';
import Chatbot from './pages/Chatbot';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

// Loading Component
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
  </div>
);

function App() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  if (loading) {
    return <LoadingScreen />;
  }

  const PrivateRoute = ({ children }) => {
    return user ? children : <Navigate to="/login" />;
  };

  const PublicRoute = ({ children }) => {
    return !user ? children : <Navigate to="/dashboard" />;
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <motion.div
                  key="login"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={{ duration: 0.3 }}
                >
                  <Login />
                </motion.div>
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <motion.div
                  key="register"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={{ duration: 0.3 }}
                >
                  <Register />
                </motion.div>
              </PublicRoute>
            }
          />

          {/* Private Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                  <motion.div
                    key="dashboard"
                    initial="initial"
                    animate="animate"
                    variants={pageVariants}
                    transition={{ duration: 0.3 }}
                  >
                    <Dashboard />
                  </motion.div>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/food-log"
            element={
              <PrivateRoute>
                <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                  <motion.div
                    key="food-log"
                    initial="initial"
                    animate="animate"
                    variants={pageVariants}
                    transition={{ duration: 0.3 }}
                  >
                    <FoodLog />
                  </motion.div>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/exercise"
            element={
              <PrivateRoute>
                <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                  <motion.div
                    key="exercise"
                    initial="initial"
                    animate="animate"
                    variants={pageVariants}
                    transition={{ duration: 0.3 }}
                  >
                    <Exercise />
                  </motion.div>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/nutrition-analysis"
            element={
              <PrivateRoute>
                <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                  <motion.div
                    key="nutrition-analysis"
                    initial="initial"
                    animate="animate"
                    variants={pageVariants}
                    transition={{ duration: 0.3 }}
                  >
                    <NutritionAnalysis />
                  </motion.div>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/chatbot"
            element={
              <PrivateRoute>
                <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                  <motion.div
                    key="chatbot"
                    initial="initial"
                    animate="animate"
                    variants={pageVariants}
                    transition={{ duration: 0.3 }}
                  >
                    <Chatbot />
                  </motion.div>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                  <motion.div
                    key="profile"
                    initial="initial"
                    animate="animate"
                    variants={pageVariants}
                    transition={{ duration: 0.3 }}
                  >
                    <Profile />
                  </motion.div>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                  <motion.div
                    key="settings"
                    initial="initial"
                    animate="animate"
                    variants={pageVariants}
                    transition={{ duration: 0.3 }}
                  >
                    <Settings />
                  </motion.div>
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Redirect root to dashboard or login */}
          <Route
            path="/"
            element={<Navigate to={user ? "/dashboard" : "/login"} />}
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

const Layout = ({ children, sidebarOpen, setSidebarOpen }) => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar for desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
        <Footer />
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default App;