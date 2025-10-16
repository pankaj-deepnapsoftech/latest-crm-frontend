import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SuperAdminModule = ({ moduleName, moduleData, columns, apiEndpoint, downloadEndpoint }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [admins, setAdmins] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if Super Admin is logged in
    const token = localStorage.getItem('superAdminToken');
    if (!token) {
      navigate('/super-admin-login');
      return;
    }
    
    fetchAdmins();
  }, [navigate]);

  const fetchAdmins = async () => {
    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8066';
      const response = await axios.get(`${baseURL}super-admin/admins`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superAdminToken') || ''}`
        }
      });
      setAdmins(response.data.admins);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to fetch admins data');
    }
  };

  const fetchData = async (adminId) => {
    if (!adminId) return;
    
    setLoading(true);
    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8066';
      const response = await axios.get(`${baseURL}super-admin/${apiEndpoint}/${adminId}`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superAdminToken') || ''}`
        }
      });
      setData(response.data[moduleData] || []);
    } catch (error) {
      console.error(`Error fetching ${moduleName.toLowerCase()}:`, error);
      toast.error(`Failed to fetch ${moduleName.toLowerCase()} data`);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminChange = (e) => {
    const adminId = e.target.value;
    setSelectedAdmin(adminId);
    setCurrentPage(1); // Reset to first page when admin changes
    if (adminId) {
      fetchData(adminId);
    } else {
      setData([]);
    }
  };

  const handleDownload = async () => {
    if (!selectedAdmin) {
      toast.error('Please select an admin first');
      return;
    }

    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8066';
      const response = await axios.get(`${baseURL}super-admin/${downloadEndpoint}/${selectedAdmin}`, {
        withCredentials: true,
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superAdminToken') || ''}`
        }
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const adminName = admins.find(admin => admin._id === selectedAdmin)?.name || 'admin';
      link.setAttribute('download', `${moduleName.toLowerCase()}_${adminName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`${moduleName} data exported successfully`);
    } catch (error) {
      console.error(`Error exporting ${moduleName.toLowerCase()}:`, error);
      toast.error(`Failed to export ${moduleName.toLowerCase()} data`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('superAdminToken');
    navigate('/super-admin-login');
    toast.success('Logged out successfully');
  };

  // Pagination logic
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

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

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{moduleName} Module</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage and export {moduleName.toLowerCase()} data by admin</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
          >
            Logout
          </button>
        </div>

        {/* Admin Selection and Download */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 w-full sm:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Admin
              </label>
              <select
                value={selectedAdmin}
                onChange={handleAdminChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              >
                <option value="">Choose an admin...</option>
                {admins.map((admin) => (
                  <option key={admin._id} value={admin._id}>
                    {admin.name} ({admin.role}) - {admin.organization?.name || 'N/A'}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-shrink-0 w-full sm:w-auto">
              <button
                onClick={handleDownload}
                disabled={!selectedAdmin || loading}
                className="w-full sm:w-auto bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                📥 Download Excel
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden w-full">
          <div className="px-3 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              {moduleName} Data {selectedAdmin && `(${data.length} records)`}
            </h2>
            {selectedAdmin && data.length > 0 && (
              <div className="text-xs sm:text-sm text-gray-600">
                Showing {startIndex + 1}-{Math.min(endIndex, data.length)} of {data.length}
              </div>
            )}
          </div>
          
          {!selectedAdmin ? (
            <div className="px-4 sm:px-6 py-8 text-center text-gray-500">
              <div className="text-3xl sm:text-4xl mb-4">👤</div>
              <p className="text-base sm:text-lg font-medium">Select an Admin</p>
              <p className="text-xs sm:text-sm">Choose an admin from the dropdown above to view {moduleName.toLowerCase()} data</p>
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : data.length > 0 ? (
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
                    {columns.map((column, index) => (
                      <th
                        key={index}
                        className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {columns.map((column, colIndex) => (
                        <td key={colIndex} className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">
                          {column.render ? column.render(item) : item[column.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-4 sm:px-6 py-8 text-center text-gray-500">
              <div className="text-3xl sm:text-4xl mb-4">📭</div>
              <p className="text-base sm:text-lg font-medium">No Data Found</p>
              <p className="text-xs sm:text-sm">No {moduleName.toLowerCase()} data found for the selected admin.</p>
            </div>
          )}

          {/* Pagination Controls */}
          {selectedAdmin && data.length > itemsPerPage && (
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
      </div>
    </div>
  );
};

export default SuperAdminModule;
