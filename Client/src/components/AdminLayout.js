import React from 'react';
import AdminSidebar from './AdminSidebar';
import { Outlet } from 'react-router-dom';

/**
 * AdminLayout component that renders the main layout for the admin panel.
 * It includes a sidebar and the main content area where the nested routes will be rendered.
 */
const AdminLayout = () => {
  return (
    <div className="flex min-h-screen flex-col sm:flex-row">
      {/* AdminSidebar is the navigation bar for admin-specific options */}
      <AdminSidebar />
      {/* Main content area where the nested components are rendered */}
      <div className="flex-1 flex flex-col bg-gray-100 p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
