import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      login(token, user);

      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/seller');
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Invalid credentials';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #1a2744, #2d5a9e)' }}>
      <div className="w-full space-y-8 bg-white p-10 rounded-[20px] shadow-xl transition-all duration-300" style={{ maxWidth: '420px' }}>
        
        {/* Header */}
        <div className="text-center">
          <h2 className="tracking-tight" style={{ color: '#1a2744', fontSize: '2rem', fontWeight: '800' }}>
            AasaMedChem
          </h2>
          <p className="mt-2 text-sm font-medium" style={{ color: '#2d5a9e' }}>
            Inventory Management System
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="block text-sm font-semibold text-slate-750 mb-1">
                Email Address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full outline-none sm:text-sm transition-colors duration-200 focus:border-[#2d5a9e]"
                style={{ border: '2px solid #d4d8e0', borderRadius: '10px', padding: '10px 14px', color: '#1a2744', backgroundColor: '#fff' }}
                placeholder="Enter email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-750 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full outline-none sm:text-sm transition-colors duration-200 focus:border-[#2d5a9e]"
                style={{ border: '2px solid #d4d8e0', borderRadius: '10px', padding: '10px 14px', color: '#1a2744', backgroundColor: '#fff' }}
                placeholder="Enter password"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm font-semibold px-4 py-2.5 rounded-lg text-center border border-red-200" style={{ color: '#c62828', backgroundColor: '#fff5f5' }}>
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center disabled:opacity-50 transition-all duration-200"
              style={{ background: '#1a2744', color: '#fff', padding: '14px', borderRadius: '12px', fontWeight: '600', fontSize: '1rem', border: 'none', cursor: 'pointer' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        {/* Demo Credentials Box */}
        <div className="mt-6 text-xs text-slate-500" style={{ background: '#fdf0f0', borderLeft: '4px solid #e8a0b0', padding: '12px', borderRadius: '8px' }}>
          <p className="font-bold mb-2" style={{ color: '#2d5a9e' }}>Test Credentials</p>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Admin:</span>
              <code className="font-mono" style={{ color: '#2d5a9e' }}>admin@aasa.com / admin123</code>
            </div>
            <div className="flex justify-between">
              <span>Seller:</span>
              <code className="font-mono" style={{ color: '#2d5a9e' }}>seller@aasa.com / seller123</code>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
