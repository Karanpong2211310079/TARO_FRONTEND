import { useState, lazy, Suspense, useEffect } from 'react';
import './App.css';
const Navbar = lazy(() => import('./User/main/navbar'));
const Login = lazy(() => import('./User/login'));
const AllCards = lazy(() => import('./User/allcards'));
const User = lazy(() => import('./User/user'));
const Manage = lazy(() => import('../Admin/main/manage'));
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const NotFound = lazy(() => import('./components/NotFound'));
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Lazy load components for better performance
const Home = lazy(() => import('./User/home'));
const GamePage = lazy(() => import('./User/game'));

// Wrapper component for pages with navbar
const PageWithNavbar = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Navbar />
    {children}
  </Suspense>
);

// Preload critical data
const preloadCriticalData = () => {
  // Preload images
  const criticalImages = [
    'https://i.postimg.cc/XNgSymzG/IMG-0869.webp',
    'https://i.postimg.cc/sX987Gwd/IMG-0870.webp',
  ];

  criticalImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });
};

function App() {
  useEffect(() => {
    // Preload critical data when app starts
    preloadCriticalData();
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <PageWithNavbar>
                    <Home />
                  </PageWithNavbar>
                </ProtectedRoute>
              }
            />
            <Route
              path="/allcards"
              element={
                <ProtectedRoute>
                  <PageWithNavbar>
                    <AllCards />
                  </PageWithNavbar>
                </ProtectedRoute>
              }
            />
            <Route
              path="/user"
              element={
                <ProtectedRoute>
                  <PageWithNavbar>
                    <User />
                  </PageWithNavbar>
                </ProtectedRoute>
              }
            />
            <Route
              path="/game"
              element={
                <ProtectedRoute>
                  <PageWithNavbar>
                    {/* Lazy load GamePage */}
                    <GamePage />
                  </PageWithNavbar>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Manage />
                </ProtectedRoute>
              }
            />
            {/* 404 - Catch all unmatched routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;