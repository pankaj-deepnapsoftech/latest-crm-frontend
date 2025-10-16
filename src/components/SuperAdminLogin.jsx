import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
// background image removed for clean light theme

const SuperAdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [checkingSuperAdmin, setCheckingSuperAdmin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if Super Admin already exists
    checkSuperAdminExists();
  }, []);

  const checkSuperAdminExists = async () => {
    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8066';
      const response = await axios.get(`${baseURL}super-admin-auth/check-exists`);
      
      if (!response.data.exists) {
        // No Super Admin exists, redirect to register
        toast.info('No Super Admin found. Please create one first.');
        navigate('/super-admin-register');
      }
    } catch (error) {
      console.error('Error checking Super Admin:', error);
      toast.error('Unable to check Super Admin status');
    } finally {
      setCheckingSuperAdmin(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8066';
      const response = await axios.post(`${baseURL}super-admin-auth/login`, formData, {
        withCredentials: true
      });

      if (response.data.success) {
        // Store the token for Super Admin
        localStorage.setItem('superAdminToken', response.data.access_token);
        toast.success('Login successful! Redirecting to dashboard...');
        // Hard redirect to ensure components see the token immediately
        window.location.replace('/super-admin');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different error types
      if (error.response?.status === 404) {
        toast.error('Super Admin not found. Please check your email.');
      } else if (error.response?.status === 401) {
        toast.error('Invalid password. Please try again.');
      } else if (error.response?.status === 403) {
        toast.error('Account is deactivated. Please contact support.');
      } else {
        toast.error(error.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingSuperAdmin) {
    return (
      <div className="min-h-screen relative bg-gradient-to-br from-sky-50 via-white to-indigo-50 overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-sky-200/40 rounded-full blur-3xl"/>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-200/40 rounded-full blur-3xl"/>
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-24 w-24 border-[6px] border-indigo-200 border-t-indigo-500 mx-auto"></div>
          <p className="mt-6 text-gray-600 font-medium">Checking Super Admin status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50">
      <div className="relative z-10 max-w-6xl mx-auto min-h-screen flex items-center justify-center px-6 sm:px-10 pt-8">
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg">
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-3xl p-8 sm:p-10">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-8 h-8">
                  <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14h-2v-2h2v2zm0-4h-2V6h2v6z"/>
                </svg>
              </div>
              <h2 className="mt-5 text-2xl sm:text-3xl font-extrabold text-gray-900">Super Admin Login</h2>
              <p className="mt-2 text-sm text-gray-600">Access the Super Admin panel</p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="relative">
                  <label htmlFor="email" className="sr-only">Email address</label>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-400">
                      <path d="M1.5 8.67L12 13.5l10.5-4.83v8.16c0 .62-.5 1.12-1.12 1.12H2.62A1.12 1.12 0 011.5 16.83V8.67z"/>
                      <path d="M12 12L1.5 7.17V7.12C1.5 6.5 2 6 2.62 6h18.76c.62 0 1.12.5 1.12 1.12v.05L12 12z"/>
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full pl-12 pr-4 py-3 rounded-xl bg-white/80 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent shadow-sm"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="relative">
                  <label htmlFor="password" className="sr-only">Password</label>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-400">
                      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25V9H5.25A2.25 2.25 0 003 11.25v7.5A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75v-7.5A2.25 2.25 0 0018.75 9H17.25V6.75A5.25 5.25 0 0012 1.5zm-3 7.5V6.75a3 3 0 116 0V9h-6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="block w-full pl-12 pr-10 py-3 rounded-xl bg-white/80 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent shadow-sm"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer">
                    {showPassword ? (
                      <IoEyeOutline size={20} onClick={() => setShowPassword(false)} className="text-gray-400 hover:text-indigo-500" />
                    ) : (
                      <IoEyeOffOutline size={20} onClick={() => setShowPassword(true)} className="text-gray-400 hover:text-indigo-500" />
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center items-center py-3 px-4 rounded-xl text-white bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 shadow-lg shadow-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking credentials...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Back to Regular Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
