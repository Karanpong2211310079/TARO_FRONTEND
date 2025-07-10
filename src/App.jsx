import { useState, lazy, Suspense } from 'react';
import './App.css';
import Navbar from './User/main/navbar';
import Login from './User/login';
import AllCards from './User/allcards';
import User from './User/user';
import Manage from '../Admin/main/manage';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './components/NotFound';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Lazy load components for better performance
const Home = lazy(() => import('./User/home'));

// Wrapper component for pages with navbar
const PageWithNavbar = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Navbar />
    {children}
  </Suspense>
);

function App() {
  return (
    <ErrorBoundary>
      <Router>
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
      </Router>
    </ErrorBoundary>
  );
}

export default App;