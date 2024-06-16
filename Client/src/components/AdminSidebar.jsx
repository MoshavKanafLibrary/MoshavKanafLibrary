import React, { useState } from 'react';
import { FaPlus, FaEdit, FaBook, FaTasks, FaPrint, FaBookReader, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AdminSidebar = ({ isVisible, toggleSidebar }) => {
  const navigate = useNavigate();
  const [expandBooks, setExpandBooks] = useState(true);
  const [expandRequests, setExpandRequests] = useState(true);
  const [expandReports, setExpandReports] = useState(true);
  const [expandPermissions, setExpandPermissions] = useState(true);

  const handleNavigate = (path, state = {}) => {
    toggleSidebar(); // Close the sidebar when a link is clicked
    navigate(path, { state });
  };

  return (
    <div
      className={`fixed top-0 right-0 w-64 sm:w-80 h-full bg-gray-700 text-white flex flex-col rounded-lg transition-transform duration-300 transform ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
      } sm:translate-x-0 z-50 sm:z-auto`}
    >
      <div className="p-4 sm:p-6 font-bold text-xl sm:text-3xl">Admin Panel</div>
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandBooks(!expandBooks)}>
          <span className="font-semibold text-lg sm:text-xl">Books</span>
          {expandBooks ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        {expandBooks && (
          <ul className="flex flex-col space-y-2 sm:space-y-3 mt-2 sm:mt-3">
            <li className="flex items-center p-2 sm:p-3 hover:bg-gray-600 rounded cursor-pointer" onClick={() => handleNavigate("/AddOrUpdateBook")}>
              <FaPlus className="text-lg sm:text-2xl mr-2 sm:mr-3" />
              <span className="text-md sm:text-lg">Add a New Book</span>
            </li>
            <li className="flex items-center p-2 sm:p-3 hover:bg-gray-600 rounded cursor-pointer" onClick={() => handleNavigate("/presentBooks", { mode: 1 })}>
              <FaEdit className="text-lg sm:text-2xl mr-2 sm:mr-3" />
              <span className="text-md sm:text-lg">Update a Book</span>
            </li>
            <li className="flex items-center p-2 sm:p-3 hover:bg-gray-600 rounded cursor-pointer" onClick={() => handleNavigate("/searchbook", { mode: 1 })}>
              <FaBook className="text-lg sm:text-2xl mr-2 sm:mr-3" />
              <span className="text-md sm:text-lg">Order a Book</span>
            </li>
          </ul>
        )}
      </div>
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandRequests(!expandRequests)}>
          <span className="font-semibold text-lg sm:text-xl">Requests</span>
          {expandRequests ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        {expandRequests && (
          <ul className="flex flex-col space-y-2 sm:space-y-3 mt-2 sm:mt-3">
            <li className="flex items-center p-2 sm:p-3 hover:bg-gray-600 rounded cursor-pointer" onClick={() => handleNavigate("/WaitingList", { mode: 0 })}>
              <FaTasks className="text-lg sm:text-2xl mr-2 sm:mr-3" />
              <span className="text-md sm:text-lg">Borrow Requests</span>
            </li>
            <li className="flex items-center p-2 sm:p-3 hover:bg-gray-600 rounded cursor-pointer" onClick={() => handleNavigate("/CreateRequestForUser", { mode: 0 })}>
              <FaBookReader className="text-lg sm:text-2xl mr-2 sm:mr-3" />
              <span className="text-md sm:text-lg">Create Borrow Request</span>
            </li>
            <li className="flex items-center p-2 sm:p-3 hover:bg-gray-600 rounded cursor-pointer" onClick={() => handleNavigate("/BorrowedCopies", { mode: 0 })}>
              <FaTasks className="text-lg sm:text-2xl mr-2 sm:mr-3" />
              <span className="text-md sm:text-lg">Return Requests</span>
            </li>
          </ul>
        )}
      </div>
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandReports(!expandReports)}>
          <span className="font-semibold text-lg sm:text-xl">Reports</span>
          {expandReports ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        {expandReports && (
          <ul className="flex flex-col space-y-2 sm:space-y-3 mt-2 sm:mt-3">
            <li className="flex items-center p-2 sm:p-3 hover:bg-gray-600 rounded cursor-pointer" onClick={() => handleNavigate("/AllBooks", { mode: 0 })}>
              <FaPrint className="text-lg sm:text-2xl mr-2 sm:mr-3" />
              <span className="text-md sm:text-lg">Books Reports</span>
            </li>
            <li className="flex items-center p-2 sm:p-3 hover:bg-gray-600 rounded cursor-pointer" onClick={() => handleNavigate("/AllUsers", { mode: 0 })}>
              <FaBookReader className="text-lg sm:text-2xl mr-2 sm:mr-3" />
              <span className="text-md sm:text-lg">User Reports</span>
            </li>
          </ul>
        )}
      </div>
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandPermissions(!expandPermissions)}>
          <span className="font-semibold text-lg sm:text-xl">Permissions</span>
          {expandPermissions ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        {expandPermissions && (
          <ul className="flex flex-col space-y-2 sm:space-y-3 mt-2 sm:mt-3">
            <li className="flex items-center p-2 sm:p-3 hover:bg-gray-600 rounded cursor-pointer" onClick={() => handleNavigate("/Permissions", { mode: 0 })}>
              <FaPrint className="text-lg sm:text-2xl mr-2 sm:mr-3" />
              <span className="text-md sm:text-lg">Users Permissions</span>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;
