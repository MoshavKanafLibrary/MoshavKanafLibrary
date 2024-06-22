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
    <>
      {/* Overlay to dim the background when the sidebar is open on mobile */}
      {isVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
          onClick={toggleSidebar}
        />
      )}
      <div
        className={`fixed top-16 sm:top-[64px] right-0 w-56 sm:w-72 h-[calc(100%-4rem)] sm:h-[calc(100%-64px)] bg-gray-700 text-white flex flex-col rounded-lg transition-transform duration-300 transform ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        } sm:translate-x-0 z-50 sm:z-auto`}
      >
        <div className="pt-4">
          <div className="p-3 sm:p-4 font-bold text-lg sm:text-2xl">Admin Panel</div>
        </div>
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandBooks(!expandBooks)}>
            <span className="font-semibold text-base sm:text-lg">Books</span>
            {expandBooks ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          {expandBooks && (
            <ul className="flex flex-col space-y-1 sm:space-y-2 mt-1 sm:mt-2">
              <li className="flex items-center p-2 sm:p-2 hover:bg-gray-600 rounded cursor-pointer" onClick={() => handleNavigate("/AddOrUpdateBook")}>
                <FaPlus className="text-base sm:text-xl mr-2 sm:mr-2" />
                <span className="text-sm sm:text-base">Add a New Book</span>
              </li>
              <li className="flex items-center p-2 sm:p-2 hover:bg-gray-600 rounded cursor-pointer" onClick={() => handleNavigate("/presentBooks", { mode: 1 })}>
                <FaEdit className="text-base sm:text-xl mr-2 sm:mr-2" />
                <span className="text-sm sm:text-base">Update a Book</span>
              </li>
              <li className="flex items-center p-2 sm:p-2 hover:bg-gray-600 rounded cursor-pointer" onClick={() => handleNavigate("/searchbook", { mode: 1 })}>
                <FaBook className="text-base sm:text-xl mr-2 sm:mr-2" />
                <span className="text-sm sm:text-base">Order a Book</span>
              </li>
            </ul>
          )}
        </div>
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandRequests(!expandRequests)}>
            <span className="font-semibold text-base sm:text-lg">Requests</span>
            {expandRequests ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          {expandRequests && (
            <ul className="flex flex-col space-y-1 sm:space-y-2 mt-1 sm:mt-2">
              <li className="flex items-center p-2 sm:p-2 hover:bg-gray-600 rounded cursor-pointer" onClick={() => handleNavigate("/WaitingList", { mode: 0 })}>
                <FaTasks className="text-base sm:text-xl mr-2 sm:mr-2" />
                <span className="text-sm sm:text-base">Borrow Requests</span>
              </li>
              <li className="flex items-center p-2 sm:p-2 hover:bg-gray-600 rounded cursor-pointer" onClick={() => handleNavigate("/CreateRequestForUser", { mode: 0 })}>
                <FaBookReader className="text-base sm:text-xl mr-2 sm:mr-2" />
                <span className="text-sm sm:text-base">Create Borrow Request</span>
              </li>
              <li className="flex items-center p-2 sm:p-2 hover:bg-gray-600 rounded cursor-pointer" onClick={() => handleNavigate("/BorrowedCopies", { mode: 0 })}>
                <FaTasks className="text-base sm:text-xl mr-2 sm:mr-2" />
                <span className="text-sm sm:text-base">Return Requests</span>
              </li>
              <li className="flex items-center p-2 sm:p-2 hover:bg-gray-600 rounded cursor-pointer" onClick={() => handleNavigate("/all-requests", { mode: 0 })}>
                <FaTasks className="text-base sm:text-xl mr-2 sm:mr-2" />
                <span className="text-sm sm:text-base">User Requests</span>
              </li>
            </ul>
          )}
        </div>
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandReports(!expandReports)}>
            <span className="font-semibold text-base sm:text-lg">Reports</span>
            {expandReports ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          {expandReports && (
            <ul className="flex flex-col space-y-1 sm:space-y-2 mt-1 sm:mt-2">
              <li className="flex items-center p-2 sm:p-2 hover:bg-gray-600 rounded cursor-pointer" onClick={() => handleNavigate("/AllBooks", { mode: 0 })}>
                <FaPrint className="text-base sm:text-xl mr-2 sm:mr-2" />
                <span className="text-sm sm:text-base">Books Reports</span>
              </li>
              <li className="flex items-center p-2 sm:p-2 hover:bg-gray-600 rounded cursor-pointer" onClick={() => handleNavigate("/AllUsers", { mode: 0 })}>
                <FaBookReader className="text-base sm:text-xl mr-2 sm:mr-2" />
                <span className="text-sm sm:text-base">User Reports</span>
              </li>
              <li className="flex items-center p-2 sm:p-2 hover:bg-gray-600 rounded cursor-pointer" onClick={() => handleNavigate("/BorrowedCopiesReport", { mode: 0 })}>
                <FaBookReader className="text-base sm:text-xl mr-2 sm:mr-2" />
                <span className="text-sm sm:text-base">Borrowed Copies Reports</span>
              </li>
            </ul>
          )}
        </div>
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandPermissions(!expandPermissions)}>
            <span className="font-semibold text-base sm:text-lg">Permissions</span>
            {expandPermissions ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          {expandPermissions && (
            <ul className="flex flex-col space-y-1 sm:space-y-2 mt-1 sm:mt-2">
              <li className="flex items-center p-2 sm:p-2 hover:bg-gray-600 rounded cursor-pointer" onClick={() => handleNavigate("/Permissions", { mode: 0 })}>
                <FaPrint className="text-base sm:text-xl mr-2 sm:mr-2" />
                <span className="text-sm sm:text-base">Users Permissions</span>
              </li>
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
