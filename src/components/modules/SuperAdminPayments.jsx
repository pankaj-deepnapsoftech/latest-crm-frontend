import React from 'react';
import SuperAdminModule from '../SuperAdminModule';

const SuperAdminPayments = () => {
  const columns = [
    {
      header: 'Payment ID',
      key: '_id',
      render: (item) => item._id?.substring(0, 8) + '...'
    },
    {
      header: 'Payment Name',
      key: 'paymentname'
    },
    {
      header: 'Invoice',
      key: 'invoice',
      render: (item) => item.invoice?.invoicename || 'N/A'
    },
    {
      header: 'Amount',
      key: 'amount',
      render: (item) => `₹${item.amount?.toLocaleString() || '0'}`
    },
    {
      header: 'Mode',
      key: 'mode',
      render: (item) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          item.mode === 'Cash' ? 'bg-green-100 text-green-800' :
          item.mode === 'UPI' ? 'bg-blue-100 text-blue-800' :
          item.mode === 'NEFT' ? 'bg-purple-100 text-purple-800' :
          item.mode === 'RTGS' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {item.mode || 'N/A'}
        </span>
      )
    },
    {
      header: 'Reference',
      key: 'reference',
      render: (item) => item.reference || 'N/A'
    },
    {
      header: 'Description',
      key: 'description',
      render: (item) => item.description || 'N/A'
    },
    {
      header: 'Created',
      key: 'createdAt',
      render: (item) => new Date(item.createdAt).toLocaleDateString()
    }
  ];

  return (
    <SuperAdminModule
      moduleName="Payments"
      moduleData="payments"
      columns={columns}
      apiEndpoint="payments"
      downloadEndpoint="export-payments"
    />
  );
};

export default SuperAdminPayments;
