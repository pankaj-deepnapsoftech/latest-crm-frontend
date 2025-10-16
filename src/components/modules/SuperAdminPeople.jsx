import React from 'react';
import SuperAdminModule from '../SuperAdminModule';

const SuperAdminPeople = () => {
  const columns = [
    {
      header: 'Contact ID',
      key: '_id',
      render: (item) => item._id?.substring(0, 8) + '...'
    },
    {
      header: 'First Name',
      key: 'firstname'
    },
    {
      header: 'Last Name',
      key: 'lastname'
    },
    {
      header: 'Email',
      key: 'email',
      render: (item) => item.email || 'N/A'
    },
    {
      header: 'Phone',
      key: 'phone',
      render: (item) => item.phone || 'N/A'
    },
    {
      header: 'Verified',
      key: 'verify',
      render: (item) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          item.verify ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {item.verify ? 'Verified' : 'Pending'}
        </span>
      )
    },
    {
      header: 'Email Sent',
      key: 'emailSentDate',
      render: (item) => item.emailSentDate ? new Date(item.emailSentDate).toLocaleDateString() : 'N/A'
    },
    {
      header: 'WhatsApp Sent',
      key: 'whatsappSentDate',
      render: (item) => item.whatsappSentDate ? new Date(item.whatsappSentDate).toLocaleDateString() : 'N/A'
    },
    {
      header: 'Created',
      key: 'createdAt',
      render: (item) => new Date(item.createdAt).toLocaleDateString()
    }
  ];

  return (
    <SuperAdminModule
      moduleName="People"
      moduleData="people"
      columns={columns}
      apiEndpoint="people"
      downloadEndpoint="export-people"
    />
  );
};

export default SuperAdminPeople;
