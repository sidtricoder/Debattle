import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';

import DashboardPage from './pages/DashboardPage';
import DebatePage from './pages/DebatePage';
import FindDebatePage from './pages/FindDebatePage';
import HistoryPage from './pages/HistoryPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import PracticePage from './pages/PracticePage';
import NotFoundPage from './pages/NotFoundPage';
import LandingPage from './pages/LandingPage';
import UsersDebatePage from './pages/UsersDebatePage';
import AboutPage from './pages/AboutPage';
import FeaturesPage from './pages/FeaturesPage';
import DonatePage from './pages/DonatePage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import './index.css';

function useProximityScrollbar() {
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      const threshold = 24;
      const x = e.clientX;
      const windowWidth = window.innerWidth;
      const nearRightEdge = windowWidth - x < threshold;
      document.querySelectorAll('.scrollbar-fade').forEach(el => {
        if (nearRightEdge) {
          el.classList.add('show-scrollbar');
        } else {
          el.classList.remove('show-scrollbar');
        }
      });
    }
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
}

const App: React.FC = () => {
  useProximityScrollbar();
  return (
    <AuthProvider>
      <div className="App">
          <Routes>
          {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/donate" element={<DonatePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
          
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
            <Route
              path="/users-debate/:roomId"
              element={
                <ProtectedRoute>
                  <UsersDebatePage />
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