import React from 'react';
import SuperAdminModule from '../SuperAdminModule';

const SuperAdminProducts = () => {
  const columns = [
    {
      header: 'Product ID',
      key: '_id',
      render: (item) => item._id?.substring(0, 8) + '...'
    },
    {
      header: 'Name',
      key: 'name'
    },
    {
      header: 'Model',
      key: 'model'
    },
    {
      header: 'Category',
      key: 'category',
      render: (item) => item.category?.categoryname || 'N/A'
    },
    {
      header: 'Price',
      key: 'price',
      render: (item) => `₹${item.price || '0'}`
    },
    {
      header: 'Description',
      key: 'description',
      render: (item) => item.description || 'N/A'
    },
    {
      header: 'Reference',
      key: 'ref',
      render: (item) => item.ref || 'N/A'
    },
    {
      header: 'Stock',
      key: 'stock',
      render: (item) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          item.stock > 50 ? 'bg-green-100 text-green-800' :
          item.stock > 20 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {item.stock || 0}
        </span>
      )
    },
    {
      header: 'Created',
      key: 'createdAt',
      render: (item) => new Date(item.createdAt).toLocaleDateString()
    }
  ];

  return (
    <SuperAdminModule
      moduleName="Products"
      moduleData="products"
      columns={columns}
      apiEndpoint="products"
      downloadEndpoint="export-products"
    />
  );
};

export default SuperAdminProducts;
