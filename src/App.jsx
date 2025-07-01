import { useState, lazy, Suspense } from 'react';
import './App.css';
import Navbar from './User/main/navbar';
import Login from './User/login';
import AllCards from './User/allcards';
import User from './User/user';
import Manage from '../Admin/main/manage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Lazy load คอมโพเนนต์เพื่อลดการโหลดครั้งแรก
const Home = lazy(() => import('./User/home'));

function App() {
  const [count, setCount] = useState(0);

  const Main = () => (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen bg-gray-600">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <Navbar />
      <Home />
    </Suspense>
  );

  const AllCard = () => (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen bg-gray-600">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <Navbar />
      <AllCards />
    </Suspense>
  );

  const User_Page = () => (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen bg-gray-600">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <Navbar />
      <User />
    </Suspense>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Main />} />
        <Route path="/allcards" element={<AllCard />} />
        <Route path="/user" element={<User_Page />} />
        <Route path="/admin" element={<Manage />} />
      </Routes>
    </Router>
  );
}

export default App;