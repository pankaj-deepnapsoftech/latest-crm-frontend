import React from 'react';
import SuperAdminModule from '../SuperAdminModule';

const SuperAdminInvoices = () => {
  const columns = [
    {
      header: 'Invoice ID',
      key: '_id',
      render: (item) => item._id?.substring(0, 8) + '...'
    },
    {
      header: 'Invoice Name',
      key: 'invoicename'
    },
    {
      header: 'Status',
      key: 'status',
      render: (item) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          item.status === 'Sent' ? 'bg-green-100 text-green-800' :
          item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {item.status}
        </span>
      )
    },
    {
      header: 'Payment Status',
      key: 'paymentstatus',
      render: (item) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          item.paymentstatus === 'Paid' ? 'bg-green-100 text-green-800' :
          item.paymentstatus === 'Partially Paid' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {item.paymentstatus}
        </span>
      )
    },
    {
      header: 'Customer',
      key: 'customer',
      render: (item) => item.customer?.customertype || 'N/A'
    },
    {
      header: 'Subtotal',
      key: 'subtotal',
      render: (item) => `₹${item.subtotal?.toLocaleString() || '0'}`
    },
    {
      header: 'Total',
      key: 'total',
      render: (item) => `₹${item.total?.toLocaleString() || '0'}`
    },
    {
      header: 'Paid',
      key: 'paid',
      render: (item) => `₹${item.paid?.toLocaleString() || '0'}`
    },
    {
      header: 'Balance',
      key: 'balance',
      render: (item) => `₹${item.balance?.toLocaleString() || '0'}`
    },
    {
      header: 'Expire Date',
      key: 'expiredate',
      render: (item) => new Date(item.expiredate).toLocaleDateString()
    },
    {
      header: 'Created',
      key: 'createdAt',
      render: (item) => new Date(item.createdAt).toLocaleDateString()
    }
  ];

  return (
    <SuperAdminModule
      moduleName="Invoices"
      moduleData="invoices"
      columns={columns}
      apiEndpoint="invoices"
      downloadEndpoint="export-invoices"
    />
  );
};

export default SuperAdminInvoices;
