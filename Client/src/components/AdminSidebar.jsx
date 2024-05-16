import React, { useState } from 'react';
import { FaPlus, FaEdit, FaBook, FaTasks, FaPrint, FaBookReader, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const [expandBooks, setExpandBooks] = useState(true);
  const [expandRequests, setExpandRequests] = useState(true);
  const [expandReports, setExpandReports] = useState(true);
  const [expandPermissions, setExpandPermissions] = useState(true);

  const handleNavigate = (path, state = {}) => {
    navigate(path, { state });
  };

  return (
    <div className="fixed top-22 right-4 w-80 h-full bg-gray-700 text-white flex flex-col rounded-lg">
      <div className="p-6 font-bold text-3xl">Admin Panel</div>
      <div className="p-6">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandBooks(!expandBooks)}>
          <span className="font-semibold text-xl">Books</span>
          {expandBooks ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        {expandBooks && (
          <ul className="flex flex-col space-y-3 mt-3">
            <li className="flex items-center p-3 hover:bg-gray-600 rounded cursor-pointer" onClick={() => handleNavigate("/AddOrUpdateBook")}>
              <FaPlus className="text-2xl mr-3" />
              <span className="text-lg">Add a New Book</span>
            </li>
            <li className="flex items-center p-3 hover:bg-gray-600 rounded cursor-pointer" onClick={() => handleNavigate("/presentBooks", { mode: 1 })}>
              <FaEdit className="text-2xl mr-3" />
              <span className="text-lg">Update a Book</span>
            </li>
            <li className="flex items-center p-3 hover:bg-gray-600 rounded cursor-pointer" onClick={() => handleNavigate("/searchbook", { mode: 1 })}>
              <FaBook className="text-2xl mr-3" />
              <span className="text-lg">Order a Book</span>
            </li>
          </ul>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandRequests(!expandRequests)}>
          <span className="font-semibold text-xl">Requests</span>
          {expandRequests ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        {expandRequests && (
          <ul className="flex flex-col space-y-3 mt-3">
            <li className="flex items-center p-3 hover:bg-gray-600 rounded cursor-pointer" onClick={() => handleNavigate("/WaitingList", { mode: 0 })}>
              <FaTasks className="text-2xl mr-3" />
              <span className="text-lg">Borrow Requests</span>
            </li>
            <li className="flex items-center p-3 hover:bg-gray-600 rounded cursor-pointer" onClick={() => handleNavigate("/AllBooks", { mode: 0 })}>
              <FaBookReader className="text-2xl mr-3" />
              <span className="text-lg">Create Borrow Request</span>
            </li>
            <li className="flex items-center p-3 hover:bg-gray-600 rounded cursor-pointer" onClick={() => handleNavigate("/BorrowedCopies", { mode: 0 })}>
              <FaTasks className="text-2xl mr-3" />
              <span className="text-lg">Return Requests</span>
            </li>
          </ul>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandReports(!expandReports)}>
          <span className="font-semibold text-xl">Reports</span>
          {expandReports ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        {expandReports && (
          <ul className="flex flex-col space-y-3 mt-3">
            <li className="flex items-center p-3 hover:bg-gray-600 rounded cursor-pointer" onClick={() => handleNavigate("/AllBooks", { mode: 0 })}>
              <FaPrint className="text-2xl mr-3" />
              <span className="text-lg">Books Reports</span>
            </li>
            <li className="flex items-center p-3 hover:bg-gray-600 rounded cursor-pointer" onClick={() => handleNavigate("/AllUsers", { mode: 0 })}>
              <FaBookReader className="text-2xl mr-3" />
              <span className="text-lg">User Reports</span>
            </li>
          </ul>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandPermissions(!expandPermissions)}>
          <span className="font-semibold text-xl">Permissions</span>
          {expandPermissions ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        {expandPermissions && (
          <ul className="flex flex-col space-y-3 mt-3">
            <li className="flex items-center p-3 hover:bg-gray-600 rounded cursor-pointer" onClick={() => handleNavigate("/Permissions", { mode: 0 })}>
              <FaPrint className="text-2xl mr-3" />
              <span className="text-lg">Users Permissions</span>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;
