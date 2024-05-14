// components/AdminLayout.jsx
import React from 'react';
import AdminSidebar from './AdminSidebar';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col bg-gray-100">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
