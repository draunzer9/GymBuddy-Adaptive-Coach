import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './components/Welcome';
import Login from './components/Login';
import OTPVerification from './components/OTPVerification';
import Onboarding from './components/Onboarding';
import RegistrationForm from './components/RegistrationForm';
import Home from './pages/Home';
import Workouts from './pages/Workouts';
import Dictionary from './pages/Dictionary';
import Profile from './pages/Profile';
import Progress from './pages/Progress';
import Nutrition from './pages/Nutrition';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/otp" element={<OTPVerification />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/home" element={<Home />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/dictionary" element={<Dictionary />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/nutrition" element={<Nutrition />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
