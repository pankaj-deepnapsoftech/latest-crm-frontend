import React from 'react';
import SuperAdminModule from '../SuperAdminModule';

const SuperAdminLeads = () => {
  const columns = [
    {
      header: 'Lead ID',
      key: '_id',
      render: (item) => item._id?.substring(0, 8) + '...'
    },
    {
      header: 'Type',
      key: 'leadtype'
    },
    {
      header: 'Status',
      key: 'status',
      render: (item) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          item.status === 'Completed' ? 'bg-green-100 text-green-800' :
          item.status === 'New' ? 'bg-blue-100 text-blue-800' :
          item.status === 'In Negotiation' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {item.status}
        </span>
      )
    },
    {
      header: 'Source',
      key: 'source'
    },
    {
      header: 'Category',
      key: 'leadCategory'
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
      header: 'Follow Up Date',
      key: 'followup_date',
      render: (item) => item.followup_date ? new Date(item.followup_date).toLocaleDateString() : 'N/A'
    },
    {
      header: 'Created',
      key: 'createdAt',
      render: (item) => new Date(item.createdAt).toLocaleDateString()
    }
  ];

  return (
    <SuperAdminModule
      moduleName="Leads"
      moduleData="leads"
      columns={columns}
      apiEndpoint="leads"
      downloadEndpoint="export-leads"
    />
  );
};

export default SuperAdminLeads;
