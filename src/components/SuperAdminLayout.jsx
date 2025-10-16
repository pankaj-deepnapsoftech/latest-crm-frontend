import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import SuperAdminSidebar from './SuperAdminSidebar';

const SuperAdminLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('superAdminToken');
    navigate('/super-admin-login');
    toast.success('Logged out successfully');
  };

  // Ensure token is attached to all requests from this layout downward
  useEffect(() => {
    const token = localStorage.getItem('superAdminToken');
    if (!token) {
      navigate('/super-admin-login');
      return;
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      <SuperAdminSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      <div className="flex-1 lg:ml-0 overflow-x-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Super Admin</h1>
          <div className="w-6"></div> {/* Spacer for centering */}
        </div>
        
        {/* Main Content */}
        <main className="overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
