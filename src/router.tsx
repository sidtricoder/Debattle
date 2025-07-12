import React, { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const HomePage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const SignupPage = lazy(() => import('@/pages/RegisterPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const DebatePage = lazy(() => import('@/pages/DebatePage'));
const NewDebatePage = lazy(() => import('@/pages/FindDebatePage'));
const LeaderboardPage = lazy(() => import('@/pages/LeaderboardPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const HistoryPage = lazy(() => import('@/pages/HistoryPage'));
const PracticePage = lazy(() => import('@/pages/PracticePage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/dashboard', element: <ProtectedRoute><DashboardPage /></ProtectedRoute> },
  { path: '/debate/:id', element: <ProtectedRoute><DebatePage /></ProtectedRoute> },
  { path: '/debate/new', element: <ProtectedRoute><NewDebatePage /></ProtectedRoute> },
  { path: '/find-debate', element: <ProtectedRoute><NewDebatePage /></ProtectedRoute> },
  { path: '/leaderboard', element: <ProtectedRoute><LeaderboardPage /></ProtectedRoute> },
  { path: '/profile/:userId?', element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
  { path: '/history', element: <ProtectedRoute><HistoryPage /></ProtectedRoute> },
  { path: '/practice', element: <ProtectedRoute><PracticePage /></ProtectedRoute> },
  { path: '*', element: <NotFoundPage /> },
]);

export default router; 