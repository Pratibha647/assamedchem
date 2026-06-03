import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white shadow-lg px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-8">
        {/* App Title */}
        <Link to={user.role === 'admin' ? '/admin' : '/seller'} className="font-extrabold text-2xl tracking-tight text-indigo-400 hover:text-indigo-300 transition-colors">
          AasaMedChem
        </Link>
        
        {/* Navigation Links based on Role */}
        <div className="flex space-x-6">
          {user.role === 'admin' ? (
            <>
              <Link to="/admin" className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200">
                Dashboard
              </Link>
              <Link to="/admin/products" className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200">
                Products
              </Link>
              <Link to="/admin/orders" className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200">
                Orders
              </Link>
            </>
          ) : (
            <>
              <Link to="/seller" className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200">
                Dashboard
              </Link>
              <Link to="/seller/browse" className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200">
                Browse Products
              </Link>
              <Link to="/seller/orders" className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200">
                My Orders
              </Link>
            </>
          )}
        </div>
      </div>

      {/* User Session Metadata & Actions */}
      <div className="flex items-center space-x-6">
        <div className="text-right">
          <p className="text-sm font-bold text-slate-100">{user.name}</p>
          <span className="inline-block mt-0.5 text-[10px] font-bold tracking-wider uppercase bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20">
            {user.role}
          </span>
        </div>
        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 active:scale-95 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer shadow-lg shadow-red-900/10"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
