import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SuperAdminSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: '📊',
      path: '/super-admin'
    },
    {
      id: 'subscriptions',
      name: 'Admin Subscriptions',
      icon: '💎',
      path: '/super-admin/subscriptions'
    },
    {
      id: 'leads',
      name: 'Leads',
      icon: '🎯',
      path: '/super-admin/leads'
    },
    {
      id: 'people',
      name: 'People & Contacts',
      icon: '👥',
      path: '/super-admin/people'
    },
    {
      id: 'customers',
      name: 'Customers',
      icon: '🛒',
      path: '/super-admin/customers'
    },
    {
      id: 'invoices',
      name: 'Invoices',
      icon: '📄',
      path: '/super-admin/invoices'
    },
    {
      id: 'payments',
      name: 'Payments',
      icon: '💳',
      path: '/super-admin/payments'
    },
    {
      id: 'products',
      name: 'Products',
      icon: '📦',
      path: '/super-admin/products'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    // Close mobile menu after navigation
    if (onClose) {
      onClose();
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white p-4 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        min-h-screen
      `}>
        {/* Close button for mobile */}
        <div className="flex justify-between items-center mb-8 lg:block">
          <div>
            <h2 className="text-xl font-bold">Super Admin Panel</h2>
            <p className="text-gray-400 text-sm">CRM Management System</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

export default SuperAdminSidebar;
