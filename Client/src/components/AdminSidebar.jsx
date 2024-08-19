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
      {isVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
          onClick={toggleSidebar}
        />
      )}
      <div
        className={`fixed top-16 sm:top-[64px] right-0 w-56 sm:w-72 h-[calc(100%-4rem)] sm:h-[calc(100%-64px)] bg-bg-navbar-custom text-bg-text flex flex-col rounded-lg transition-transform duration-300 transform ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        } sm:translate-x-0 z-50 sm:z-auto overflow-y-auto`} // מאפשר גלילה כלפי מטה
        dir="rtl"
      >
        <div className="pt-4">
          <div className="p-3 sm:p-4 font-bold text-md sm:text-xl">פאנל מנהלים</div>
        </div>
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandBooks(!expandBooks)}>
            <span className="font-semibold text-sm sm:text-md">ניהול ספרים</span>
            {expandBooks ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          {expandBooks && (
            <ul className="flex flex-col space-y-1 sm:space-y-2 mt-1 sm:mt-2">
              <li className="flex items-center p-2 sm:p-2 hover:bg-bg-hover hover:text-bg-header-custom rounded cursor-pointer" onClick={() => handleNavigate("/AddOrUpdateBook")}>
                <FaPlus className="text-sm sm:text-lg mr-2 sm:mr-2" />
                <span className="text-xs sm:text-sm">הוסף ספר חדש</span>
              </li>
              <li className="flex items-center p-2 sm:p-2 hover:bg-bg-hover hover:text-bg-header-custom rounded cursor-pointer" onClick={() => handleNavigate("/presentBooks", { mode: 1 })}>
                <FaEdit className="text-sm sm:text-lg mr-2 sm:mr-2" />
                <span className="text-xs sm:text-sm">עדכון/מחיקת ספר</span>
              </li>
            </ul>
          )}
        </div>
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandRequests(!expandRequests)}>
            <span className="font-semibold text-sm sm:text-md">ניהול בקשות</span>
            {expandRequests ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          {expandRequests && (
            <ul className="flex flex-col space-y-1 sm:space-y-2 mt-1 sm:mt-2">
              <li className="flex items-center p-2 sm:p-2 hover:bg-bg-hover hover:text-bg-header-custom rounded cursor-pointer" onClick={() => handleNavigate("/WaitingList", { mode: 0 })}>
                <FaTasks className="text-sm sm:text-lg ml-2 sm:ml-2" />
                <span className="text-xs sm:text-sm">אישור השאלות ספרים</span>
              </li>
              <li className="flex items-center p-2 sm:p-2 hover:bg-bg-hover hover:text-bg-header-custom rounded cursor-pointer" onClick={() => handleNavigate("/CreateRequestForUser", { mode: 0 })}>
                <FaBookReader className="text-sm sm:text-lg ml-2 sm:ml-2" />
                <span className="text-xs sm:text-sm">בקשת השאלה עבור משתמש</span>
              </li>
              <li className="flex items-center p-2 sm:p-2 hover:bg-bg-hover hover:text-bg-header-custom rounded cursor-pointer" onClick={() => handleNavigate("/BorrowedCopies", { mode: 0 })}>
                <FaTasks className="text-sm sm:text-lg ml-2 sm:ml-2" />
                <span className="text-xs sm:text-sm">ניהול החזרת ספרים</span>
              </li>
              <li className="flex items-center p-2 sm:p-2 hover:bg-bg-hover hover:text-bg-header-custom rounded cursor-pointer" onClick={() => handleNavigate("/all-requests", { mode: 0 })}>
                <FaTasks className="text-sm sm:text-lg ml-2 sm:ml-2" />
                <span className="text-xs sm:text-sm">בקשות כלליות</span>
              </li>
            </ul>
          )}
        </div>
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandReports(!expandReports)}>
            <span className="font-semibold text-sm sm:text-md">דוחות ונתונים</span>
            {expandReports ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          {expandReports && (
            <ul className="flex flex-col space-y-1 sm:space-y-2 mt-1 sm:mt-2">
              <li className="flex items-center p-2 sm:p-2 hover:bg-bg-hover hover:text-bg-header-custom rounded cursor-pointer" onClick={() => handleNavigate("/AllBooks", { mode: 0 })}>
                <FaPrint className="text-sm sm:text-lg ml-2 sm:ml-2" />
                <span className="text-xs sm:text-sm">דוחות ספרים</span>
              </li>
              <li className="flex items-center p-2 sm:p-2 hover:bg-bg-hover hover:text-bg-header-custom rounded cursor-pointer" onClick={() => handleNavigate("/AllUsers", { mode: 0 })}>
                <FaBookReader className="text-sm sm:text-lg ml-2 sm:ml-2" />
                <span className="text-xs sm:text-sm">דוחות משתמשים</span>
              </li>
              <li className="flex items-center p-2 sm:p-2 hover:bg-bg-hover hover:text-bg-header-custom rounded cursor-pointer" onClick={() => handleNavigate("/BorrowedCopiesReport", { mode: 0 })}>
                <FaBookReader className="text-sm sm:text-lg ml-2 sm:ml-2" />
                <span className="text-xs sm:text-sm">דוחות השאלות</span>
              </li>
              <li className="flex items-center p-2 sm:p-2 hover:bg-bg-hover hover:text-bg-header-custom rounded cursor-pointer" onClick={() => handleNavigate("/SelectBook", { mode: 0 })}>
                <FaPrint className="text-sm sm:text-lg ml-2 sm:ml-2" />
                <span className="text-xs sm:text-sm">נתונים על ספר</span>
              </li>
              <li className="flex items-center p-2 sm:p-2 hover:bg-bg-hover hover:text-bg-header-custom rounded cursor-pointer" onClick={() => handleNavigate("/SelectUser", { mode: 0 })}>
                <FaBookReader className="text-sm sm:text-lg ml-2 sm:ml-2" />
                <span className="text-xs sm:text-sm">נתונים על משתמש</span>
              </li>
            </ul>
          )}
        </div>
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandPermissions(!expandPermissions)}>
            <span className="font-semibold text-sm sm:text-md">ניהול הרשאות</span>
            {expandPermissions ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          {expandPermissions && (
            <ul className="flex flex-col space-y-1 sm:space-y-2 mt-1 sm:mt-2">
              <li className="flex items-center p-2 sm:p-2 hover:bg-bg-hover hover:text-bg-header-custom rounded cursor-pointer" onClick={() => handleNavigate("/Permissions", { mode: 0 })}>
                <FaPrint className="text-sm sm:text-lg ml-2 sm:ml-2" />
                <span className="text-xs sm:text-sm">הרשאות משתמשים</span>
              </li>
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
