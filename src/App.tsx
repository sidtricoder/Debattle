import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DebatePage from './pages/DebatePage';
import FindDebatePage from './pages/FindDebatePage';
import HistoryPage from './pages/HistoryPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import PracticePage from './pages/PracticePage';
import NotFoundPage from './pages/NotFoundPage';
import LandingPage from './pages/LandingPage';
import './index.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="App">
          <Routes>
          {/* Landing page - no layout wrapper */}
            <Route path="/" element={<LandingPage />} />
          
          {/* Auth pages - no layout wrapper */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
          {/* Protected routes with layout */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/debate/:debateId"
              element={
                <ProtectedRoute>
                  <DebatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/debate/new"
              element={
                <ProtectedRoute>
                <Layout>
                  <FindDebatePage />
                </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/find-debate"
              element={
                <ProtectedRoute>
                <Layout>
                  <FindDebatePage />
                </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                <Layout>
                  <HistoryPage />
                </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                <Layout>
                  <LeaderboardPage />
                </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:userId?"
              element={
                <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/practice"
              element={
                <ProtectedRoute>
                <Layout>
                  <PracticePage />
                </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Catch all route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
      </div>
    </AuthProvider>
  );
};

export default App; 