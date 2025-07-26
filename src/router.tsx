import React, { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UsersDebatePage from '@/pages/UsersDebatePage';
import UsersDebateRoom2 from '@/components/debate/UsersDebateRoom2';

const HomePage = lazy(() => import('@/pages/LandingPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const DebatePage = lazy(() => import('@/pages/DebatePage'));
const NewDebatePage = lazy(() => import('@/pages/FindDebatePage'));
const LeaderboardPage = lazy(() => import('@/pages/LeaderboardPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const HistoryPage = lazy(() => import('@/pages/HistoryPage'));
const PracticePage = lazy(() => import('@/pages/PracticePage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/dashboard', element: <ProtectedRoute><DashboardPage /></ProtectedRoute> },
  { path: '/debate/:debateId', element: <ProtectedRoute><DebatePage /></ProtectedRoute> },
  { 
    path: '/users-debate/:roomId', 
    element: <ProtectedRoute>
      <div style={{ padding: '20px', color: 'white', background: 'black' }}>
        <h1>UsersDebatePage Test</h1>
        <p>Route is working!</p>
        <UsersDebatePage />
      </div>
    </ProtectedRoute> 
  },
  { path: '/custom-debate/:id', element: <ProtectedRoute><UsersDebateRoom2 /></ProtectedRoute> },
  { path: '/debate/new', element: <ProtectedRoute><NewDebatePage /></ProtectedRoute> },
  { path: '/find-debate', element: <ProtectedRoute><NewDebatePage /></ProtectedRoute> },
  { path: '/leaderboard', element: <ProtectedRoute><LeaderboardPage /></ProtectedRoute> },
  { path: '/profile/:userId?', element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
  { path: '/history', element: <ProtectedRoute><HistoryPage /></ProtectedRoute> },
  { path: '/practice', element: <ProtectedRoute><PracticePage /></ProtectedRoute> },
  { path: '/about', element: <AboutPage /> },
  { path: '*', element: <NotFoundPage /> },
]);

export default router; 