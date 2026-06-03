import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="text-white shadow-lg flex items-center justify-between" style={{ backgroundColor: '#1a2744', padding: '16px 32px' }}>
      <div className="flex items-center space-x-8">
        {/* App Title */}
        <Link to={user.role === 'admin' ? '/admin' : '/seller'} className="tracking-tight transition-colors" style={{ color: '#fff', fontWeight: '800', fontSize: '1.25rem' }}>
          AasaMedChem
        </Link>
        
        {/* Navigation Links based on Role */}
        <div className="flex space-x-6">
          {user.role === 'admin' ? (
            <>
              <Link to="/admin" className="px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:text-white" style={{ color: '#e8a0b0' }}>
                Dashboard
              </Link>
              <Link to="/admin/products" className="px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:text-white" style={{ color: '#e8a0b0' }}>
                Products
              </Link>
              <Link to="/admin/orders" className="px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:text-white" style={{ color: '#e8a0b0' }}>
                Orders
              </Link>
            </>
          ) : (
            <>
              <Link to="/seller" className="px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:text-white" style={{ color: '#e8a0b0' }}>
                Dashboard
              </Link>
              <Link to="/seller/browse" className="px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:text-white" style={{ color: '#e8a0b0' }}>
                Browse Products
              </Link>
              <Link to="/seller/orders" className="px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:text-white" style={{ color: '#e8a0b0' }}>
                My Orders
              </Link>
            </>
          )}
        </div>
      </div>

      {/* User Session Metadata & Actions */}
      <div className="flex items-center space-x-6">
        <div className="text-right">
          <p className="text-sm font-bold" style={{ color: '#fff' }}>{user.name}</p>
          <span className="inline-block mt-0.5 font-bold tracking-wider uppercase" style={{ backgroundColor: '#e8a0b0', color: '#1a2744', borderRadius: '999px', padding: '2px 10px', fontSize: '0.75rem' }}>
            {user.role}
          </span>
        </div>
        <button
          onClick={logout}
          className="active:scale-95 text-sm font-semibold transition-all duration-200 cursor-pointer hover:bg-[#e8a0b0] hover:text-[#1a2744]"
          style={{ border: '2px solid #e8a0b0', color: '#e8a0b0', backgroundColor: 'transparent', borderRadius: '8px', padding: '6px 16px' }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
