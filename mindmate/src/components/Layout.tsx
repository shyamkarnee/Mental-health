import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { MessageSquare, Activity, BookHeart, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function Layout() {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Chat Companion', path: '/', icon: MessageSquare },
    { name: 'Mood Tracker', path: '/mood', icon: Activity },
    { name: 'Mental Health Tools', path: '/tools', icon: BookHeart },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm"
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
            MindMate
          </h1>
          <p className="text-sm text-slate-500 mt-1">Your AI Companion</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-teal-50 text-teal-700 font-medium' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-slate-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user?.displayName || 'Guest'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2 w-full text-left text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col bg-slate-50/50">
        <Outlet />
      </main>
    </div>
  );
}
