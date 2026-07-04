import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Dumbbell, BarChart2, UtensilsCrossed, User } from 'lucide-react';
import './BottomNavigation.css';

function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/workouts', icon: Dumbbell, label: 'Workouts' },
    { path: '/progress', icon: BarChart2, label: 'Progress' },
    { path: '/nutrition', icon: UtensilsCrossed, label: 'Nutrition' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="bottom-nav-container">
      {navItems.map((item) => (
        <div 
          key={item.path}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <item.icon 
            size={24} 
            fill={location.pathname === item.path ? 'currentColor' : 'none'} 
            strokeWidth={location.pathname === item.path ? 2 : 1.5}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default BottomNavigation;
