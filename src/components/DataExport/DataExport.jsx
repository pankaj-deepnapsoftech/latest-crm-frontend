import React, { useState } from 'react';
import { useCookies } from 'react-cookie';
import { toast } from 'react-toastify';
import { FaDownload, FaFileExcel, FaSpinner, FaDatabase, FaUsers, FaFileInvoice, FaHandshake, FaBox } from 'react-icons/fa';
import { MdLeaderboard, MdOutlinePeople, MdHomeWork, MdOutlinePayment, MdOutlineProductionQuantityLimits, MdAttachMoney } from 'react-icons/md';

const DataExport = () => {
  const [cookies] = useCookies();
  const [isLoading, setIsLoading] = useState(false);
  const [exportingType, setExportingType] = useState('');

  const exportOptions = [
    {
      id: 'all',
      name: 'All Data',
      description: 'Export complete CRM data including all modules',
      icon: <FaDatabase className="text-blue-500" size={24} />,
      endpoint: '/data-export/export-all'
    },
    {
      id: 'admins',
      name: 'Admins',
      description: 'Export admin users data',
      icon: <FaUsers className="text-green-500" size={24} />,
      endpoint: '/data-export/export/admins'
    },
    {
      id: 'leads',
      name: 'Leads',
      description: 'Export all leads data',
      icon: <MdLeaderboard className="text-orange-500" size={24} />,
      endpoint: '/data-export/export/leads'
    },
    {
      id: 'customers',
      name: 'Customers',
      description: 'Export customers data (Individuals & Companies)',
      icon: <FaHandshake className="text-purple-500" size={24} />,
      endpoint: '/data-export/export/customers'
    },
    {
      id: 'invoices',
      name: 'Invoices',
      description: 'Export all invoices data',
      icon: <FaFileInvoice className="text-red-500" size={24} />,
      endpoint: '/data-export/export/invoices'
    },
    {
      id: 'people',
      name: 'Individuals',
      description: 'Export individual contacts data',
      icon: <MdOutlinePeople className="text-teal-500" size={24} />,
      endpoint: '/data-export/export/people'
    },
    {
      id: 'companies',
      name: 'Companies',
      description: 'Export companies data',
      icon: <MdHomeWork className="text-indigo-500" size={24} />,
      endpoint: '/data-export/export/companies'
    },
    {
      id: 'products',
      name: 'Products',
      description: 'Export products and categories data',
      icon: <MdOutlineProductionQuantityLimits className="text-pink-500" size={24} />,
      endpoint: '/data-export/export/products'
    },
    {
      id: 'payments',
      name: 'Payments',
      description: 'Export payment transactions data',
      icon: <MdOutlinePayment className="text-yellow-500" size={24} />,
      endpoint: '/data-export/export/payments'
    }
  ];

  const handleExport = async (option) => {
    if (isLoading) return;

    setIsLoading(true);
    setExportingType(option.id);

    try {
      // Remove leading slash from endpoint to avoid double slashes
      const cleanEndpoint = option.endpoint.startsWith('/') ? option.endpoint.slice(1) : option.endpoint;
      
      console.log('Backend URL:', process.env.REACT_APP_BACKEND_URL);
      console.log('Original Endpoint:', option.endpoint);
      console.log('Clean Endpoint:', cleanEndpoint);
      console.log('Final URL:', `${process.env.REACT_APP_BACKEND_URL}${cleanEndpoint}`);
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}${cleanEndpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cookies?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get filename from response headers or create default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `CRM_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`${option.name} data exported successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export ${option.name} data. Please try again.`);
    } finally {
      setIsLoading(false);
      setExportingType('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FaFileExcel className="text-green-600" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Data Export Center</h1>
              <p className="text-gray-600">Download your CRM data in Excel format</p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FaDatabase className="text-blue-500 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-800">Export Information</h3>
                <p className="text-blue-700 text-sm mt-1">
                  All exports are generated in Excel (.xlsx) format and include comprehensive data from your CRM system. 
                  Large exports may take a few moments to process.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Export Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exportOptions.map((option) => (
            <div
              key={option.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {option.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {option.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {option.description}
                  </p>
                  <button
                    onClick={() => handleExport(option)}
                    disabled={isLoading}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      isLoading && exportingType === option.id
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {isLoading && exportingType === option.id ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <FaDownload />
                        Export {option.name}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Export Tips */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs font-bold">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Complete Data Export</h4>
                <p className="text-gray-600 text-sm">Use "All Data" to export everything in a single comprehensive Excel file.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs font-bold">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Specific Module Export</h4>
                <p className="text-gray-600 text-sm">Export individual modules for targeted data analysis or reporting.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs font-bold">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Data Security</h4>
                <p className="text-gray-600 text-sm">All exports are generated securely and include only your organization's data.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs font-bold">4</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Excel Compatibility</h4>
                <p className="text-gray-600 text-sm">Files are generated in .xlsx format compatible with Excel and Google Sheets.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataExport;
