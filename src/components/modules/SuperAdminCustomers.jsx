import React from 'react';
import SuperAdminModule from '../SuperAdminModule';

const SuperAdminCustomers = () => {
  const columns = [
    {
      header: 'Customer ID',
      key: '_id',
      render: (item) => item._id?.substring(0, 8) + '...'
    },
    {
      header: 'Type',
      key: 'customertype'
    },
    {
      header: 'Status',
      key: 'status',
      render: (item) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          item.status === 'Payment Received' ? 'bg-green-100 text-green-800' :
          item.status === 'Invoice Sent' ? 'bg-blue-100 text-blue-800' :
          item.status === 'Proforma Invoice Sent' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {item.status}
        </span>
      )
    },
    {
      header: 'Contact Person',
      key: 'people',
      render: (item) => item.people ? `${item.people.firstname} ${item.people.lastname || ''}`.trim() : 'N/A'
    },
    {
      header: 'Company',
      key: 'company',
      render: (item) => item.company?.companyname || 'N/A'
    },
    {
      header: 'Products',
      key: 'products',
      render: (item) => item.products?.map(p => p.name).join(', ') || 'N/A'
    },
    {
      header: 'Created',
      key: 'createdAt',
      render: (item) => new Date(item.createdAt).toLocaleDateString()
    }
  ];

  return (
    <SuperAdminModule
      moduleName="Customers"
      moduleData="customers"
      columns={columns}
      apiEndpoint="customers"
      downloadEndpoint="export-customers"
    />
  );
};

export default SuperAdminCustomers;
