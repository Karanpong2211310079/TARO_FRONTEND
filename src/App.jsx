import { useState } from 'react'
import './App.css'
import Home from './User/home'
import Navbar from './User/main/navbar'
import Login from './user/login'
import AllCards from './User/allcards'
import User from './User/user'
import Manage from '../Admin/main/manage'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  const [count, setCount] = useState(0)

  const Main = () => (
    <>
      <Navbar />
      <Home />
    </>
  )

  const AllCard = () => (
    <>
      <Navbar />
      <AllCards />
    </>
  )
  const User_Page = () => (
    <>
      <Navbar />
      <User />
    </>
  )

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
  )
}

export default App
