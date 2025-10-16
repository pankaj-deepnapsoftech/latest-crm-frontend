import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SuperAdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [superAdminProfile, setSuperAdminProfile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [selectedAdminEmployees, setSelectedAdminEmployees] = useState([]);
  const [showEmployeesModal, setShowEmployeesModal] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if Super Admin is logged in
    const token = localStorage.getItem('superAdminToken');
    if (!token) {
      navigate('/super-admin-login');
      return;
    }
    
    fetchSuperAdminProfile();
    fetchDashboardData();
    fetchAllAdmins();
    fetchAllOrganizations();
  }, [navigate]);

  const fetchSuperAdminProfile = async () => {
    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8066';
      const response = await axios.get(`${baseURL}super-admin-auth/profile`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superAdminToken') || ''}`
        }
      });
      setSuperAdminProfile(response.data.superAdmin);
    } catch (error) {
      console.error('Error fetching Super Admin profile:', error);
      // If profile fetch fails, redirect to login
      localStorage.removeItem('superAdminToken');
      navigate('/super-admin-login');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('superAdminToken');
    navigate('/super-admin-login');
    toast.success('Logged out successfully');
  };

  const fetchDashboardData = async () => {
    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8066';
      const response = await axios.get(`${baseURL}super-admin/dashboard`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superAdminToken') || ''}`
        }
      });
      setDashboardData(response.data.dashboard);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    }
  };

  const fetchAllAdmins = async () => {
    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8066';
      const response = await axios.get(`${baseURL}super-admin/admins`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superAdminToken') || ''}`
        }
      });
      // Keep all admins for table view, will filter in cards view
      setAdmins(response.data.admins);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to fetch admins data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllOrganizations = async () => {
    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8066';
      const response = await axios.get(`${baseURL}super-admin/organizations`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superAdminToken') || ''}`
        }
      });
      setOrganizations(response.data.organizations);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Failed to fetch organizations data');
    }
  };

  const handleExportAdmins = async () => {
    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8066';
      const response = await axios.get(`${baseURL}super-admin/export-admins`, {
        withCredentials: true,
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superAdminToken') || ''}`
        }
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `super_admin_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Admin data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export admin data');
    }
  };

  const handleViewAdmin = async (adminId) => {
    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8066';
      const response = await axios.get(`${baseURL}super-admin/admin/${adminId}`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superAdminToken') || ''}`
        }
      });
      setSelectedAdmin(response.data.admin);
      setShowAdminModal(true);
    } catch (error) {
      console.error('Error fetching admin details:', error);
      toast.error('Failed to fetch admin details');
    }
  };

  const handleDeleteAdmin = async (adminId, adminName) => {
    if (window.confirm(`Are you sure you want to delete admin: ${adminName}?`)) {
      try {
        const baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8066';
        await axios.delete(`${baseURL}super-admin/admin/${adminId}`, {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('superAdminToken') || ''}`
          }
        });
        toast.success('Admin deleted successfully');
        fetchAllAdmins();
      } catch (error) {
        console.error('Error deleting admin:', error);
        toast.error('Failed to delete admin');
      }
    }
  };

  const handleExportIndividualAdmin = async (adminId, adminName) => {
    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8066';
      const response = await axios.get(`${baseURL}super-admin/export-admin/${adminId}`, {
        withCredentials: true,
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superAdminToken') || ''}`
        }
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `admin_${adminName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`${adminName}'s data exported successfully`);
    } catch (error) {
      console.error('Error exporting individual admin data:', error);
      toast.error('Failed to export admin data');
    }
  };

  const fetchEmployeesByAdmin = async (adminId) => {
    try {
      setLoadingEmployees(true);
      const baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8066';
      
      // First get admin details
      const adminResponse = await axios.get(`${baseURL}super-admin/admin/${adminId}`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superAdminToken') || ''}`
        }
      });
      setSelectedAdmin(adminResponse.data.admin);
      
      // Then get employees
      const response = await axios.get(`${baseURL}super-admin/admin/${adminId}/employees`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superAdminToken') || ''}`
        }
      });
      setSelectedAdminEmployees(response.data.employees);
      setShowEmployeesModal(true);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(admins.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAdmins = admins.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
            {superAdminProfile && (
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Welcome, {superAdminProfile.name} ({superAdminProfile.email})
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
            >
              Logout
            </button>
          </div>
        </div>
        
        {/* Dashboard Stats */}
        {dashboardData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h3 className="text-sm sm:text-lg font-semibold text-gray-700">Total Admins</h3>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600">{dashboardData.totalAdmins}</p>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h3 className="text-sm sm:text-lg font-semibold text-gray-700">Total Organizations</h3>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">{dashboardData.totalOrganizations}</p>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h3 className="text-sm sm:text-lg font-semibold text-gray-700">Verified Admins</h3>
              <p className="text-2xl sm:text-3xl font-bold text-purple-600">{dashboardData.verifiedAdmins}</p>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h3 className="text-sm sm:text-lg font-semibold text-gray-700">Super Admins</h3>
              <p className="text-2xl sm:text-3xl font-bold text-red-600">{dashboardData.superAdmins}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4">
          <button
            onClick={handleExportAdmins}
            className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
          >
            Export Super Admin Data
          </button>
          <button
            onClick={fetchAllAdmins}
            className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Refresh Data
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="mb-4 sm:mb-6 flex justify-center">
          <div className="bg-white rounded-lg shadow-md p-1 flex">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'cards'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cards View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Table View
            </button>
          </div>
        </div>

        {/* Admins Display */}
        {viewMode === 'cards' ? (
          /* Cards View */
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Super Admins</h2>
              {admins.filter(admin => admin.role === 'Super Admin').length > 0 && (
                <div className="text-xs sm:text-sm text-gray-600">
                  Total: {admins.filter(admin => admin.role === 'Super Admin').length} Super Admins
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {admins.filter(admin => admin.role === 'Super Admin').map((admin) => (
                <div
                  key={admin._id}
                  className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-blue-200"
                  onClick={() => fetchEmployeesByAdmin(admin._id)}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                      <span className="text-white text-xl font-bold">
                        {admin.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{admin.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{admin.email}</p>
                    <p className="text-sm text-gray-500 mb-3">{admin.designation}</p>
                    
                    <div className="flex flex-col space-y-2 w-full">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        {admin.role}
                      </span>
                      
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        admin.verified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {admin.verified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-200 w-full">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchEmployeesByAdmin(admin._id);
                        }}
                        className="w-full bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        View Employees
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-lg shadow-md overflow-hidden w-full">
            <div className="px-3 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">All Admins</h2>
              {admins.length > 0 && (
                <div className="text-xs sm:text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, admins.length)} of {admins.length}
                </div>
              )}
            </div>
          <div 
            className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100" 
            style={{ 
              maxWidth: '100%', 
              width: '100%',
              overflowX: 'auto',
              overflowY: 'visible'
            }}
          >
            <table className="divide-y divide-gray-200" style={{ minWidth: '800px', width: '100%' }}>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Email
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Organization
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Verified
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Created
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(() => {
                  const superAdmins = admins
                    .filter(a => a.role === 'Super Admin')
                    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                  const employeeByOrg = admins
                    .filter(a => a.role !== 'Super Admin')
                    .reduce((acc, a) => {
                      const orgId = a.organization?._id || a.organization || 'no-org';
                      if (!acc[orgId]) acc[orgId] = [];
                      acc[orgId].push(a);
                      return acc;
                    }, {});

                  const renderRow = (admin, isChild = false) => (
                    <tr key={admin._id} className={isChild ? 'hover:bg-gray-50' : 'bg-red-50 hover:bg-red-100'}>
                      <td className={`px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 ${isChild ? 'pl-5 sm:pl-10' : ''}`}>
                        <div className="flex flex-col">
                          <span className="font-medium">{admin.name}</span>
                          <span className="text-xs text-gray-500 sm:hidden">{admin.email}</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                        {admin.email}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          admin.role === 'Super Admin' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {admin.role}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        {admin.organization?.name || 'N/A'}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          admin.verified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {admin.verified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                          <button
                            onClick={() => handleViewAdmin(admin._id)}
                            className="text-blue-600 hover:text-blue-900 text-xs sm:text-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteAdmin(admin._id, admin.name)}
                            className="text-red-600 hover:text-red-900 text-xs sm:text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );

                  const rows = [];
                  superAdmins.forEach(sa => {
                    rows.push(renderRow(sa, false));
                    const orgId = sa.organization?._id || sa.organization || 'no-org';
                    const employees = (employeeByOrg[orgId] || [])
                      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    employees.forEach(emp => rows.push(renderRow(emp, true)));
                  });

                  // Append any employees that didn't match a super admin/org at the end
                  const matchedEmpIds = new Set(rows.map(r => r?.key).filter(Boolean));
                  admins
                    .filter(a => a.role !== 'Super Admin')
                    .filter(a => !matchedEmpIds.has(a._id))
                    .forEach(a => rows.push(renderRow(a, true)));

                  // Apply pagination to the rows
                  const startIndex = (currentPage - 1) * itemsPerPage;
                  const endIndex = startIndex + itemsPerPage;
                  return rows.slice(startIndex, endIndex);
                })()}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {admins.length > itemsPerPage && (
            <div className="px-3 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
                <div className="text-xs sm:text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md ${
                      currentPage === totalPages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
        )}

        {/* Employees Modal */}
        {showEmployeesModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Employees of {selectedAdmin?.name || 'Selected Admin'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowEmployeesModal(false);
                      setSelectedAdminEmployees([]);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {loadingEmployees ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : selectedAdminEmployees.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedAdminEmployees.map((employee) => (
                      <div key={employee._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900">{employee.name}</h4>
                            <p className="text-sm text-gray-600">{employee.email}</p>
                            <p className="text-sm text-gray-500">{employee.designation}</p>
                            <p className="text-sm text-gray-500">{employee.phone}</p>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              employee.verified 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {employee.verified ? 'Verified' : 'Pending'}
                            </span>
                            <span className="text-xs text-gray-500">
                              Created: {new Date(employee.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No employees found for this admin.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Admin Details Modal */}
        {showAdminModal && selectedAdmin && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Admin Details</h3>
                  <button
                    onClick={() => setShowAdminModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAdmin.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAdmin.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAdmin.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Designation</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAdmin.designation}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAdmin.role}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Organization</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAdmin.organization?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Verified</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAdmin.verified ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created At</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedAdmin.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
