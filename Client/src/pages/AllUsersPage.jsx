import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';
import * as XLSX from 'xlsx';

const AllUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    axios.get("/api/users")
      .then(response => {
        if (response.data.success && Array.isArray(response.data.users)) {
          setUsers(response.data.users);
          setFilteredUsers(response.data.users);
        } else {
          console.error("Unexpected data format:", response.data);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching users:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = users.filter(user =>
      (user.firstName && user.firstName.toLowerCase().includes(lowerCaseQuery)) ||
      (user.lastName && user.lastName.toLowerCase().includes(lowerCaseQuery)) ||
      (user.uid && user.uid.toLowerCase().includes(lowerCaseQuery)) ||
      (user.email && user.email.toLowerCase().includes(lowerCaseQuery)) ||
      (user.phone && user.phone.toString().includes(searchQuery)) ||
      (user.isManager && (user.isManager ? 'כן' : 'לא').includes(lowerCaseQuery))
    );
    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page on new search
  }, [searchQuery, users]);

  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPageNumbers = () => {
    const pages = [];
    const maxPageNumbersToShow = 5;
    const halfRange = Math.floor(maxPageNumbersToShow / 2);
    let startPage = Math.max(currentPage - halfRange, 1);
    let endPage = Math.min(startPage + maxPageNumbersToShow - 1, totalPages);

    if (endPage - startPage < maxPageNumbersToShow - 1) {
      startPage = Math.max(endPage - maxPageNumbersToShow + 1, 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => paginate(i)}
          className={`px-2 sm:px-4 py-1 sm:py-2 mx-1 sm:mx-2 rounded-lg ${i === currentPage ? 'bg-bg-hover text-bg-navbar-custom' : 'bg-bg-hover text-bg-navbar-custom'}`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredUsers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, 'users.xlsx');
  };

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
          <FaSpinner className="animate-spin text-white text-4xl sm:text-6xl" />
        </div>
      )}
      <div className="container mx-auto px-4 py-8 max-w-7xl mt-10 " dir="rtl">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-center mb-8 tracking-wide text-bg-navbar-custom">כל המשתמשים</h1>
        <input
          type="text"
          className="w-full p-2 sm:p-3 mb-4 text-base sm:text-lg bg-bg-navbar-custom text-bg-text"
          placeholder="חפש משתמשים לפי שם פרטי, שם משפחה, מזהה, אימייל, פלאפון, או סטטוס מנהל..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full bg-bg-navbar-custom rounded-lg shadow-lg text-sm sm:text-base">
            <thead className="bg-bg-text text-bg-navbar-custom text-sm sm:text-lg">
              <tr>
                <th className="py-2 sm:py-4 px-2 sm:px-6 text-right">מזהה משתמש</th>
                <th className="py-2 sm:py-4 px-2 sm:px-6 text-right">שם פרטי</th>
                <th className="py-2 sm:py-4 px-2 sm:px-6 text-right">שם משפחה</th>
                <th className="py-2 sm:py-4 px-2 sm:px-6 text-right">אימייל</th>
                <th className="py-2 sm:py-4 px-2 sm:px-6 text-right">פלאפון</th>
                <th className="py-2 sm:py-4 px-2 sm:px-6 text-right">הרשאות מנהל</th>
              </tr>
            </thead>
            <tbody className="text-bg-text">
              {currentUsers.length > 0 ? currentUsers.map((user, index) => (
                <tr key={index} className="border-b border-bg-text hover:bg-bg-hover hover:text-bg-navbar-custom">
                  <td className="py-2 sm:py-4 px-2 sm:px-6 text-right">{user.uid}</td>
                  <td className="py-2 sm:py-4 px-2 sm:px-6 text-right">{user.firstName}</td>
                  <td className="py-2 sm:py-4 px-2 sm:px-6 text-right">{user.lastName}</td>
                  <td className="py-2 sm:py-4 px-2 sm:px-6 text-right">{user.email}</td>
                  <td className="py-2 sm:py-4 px-2 sm:px-6 text-right">{user.phone}</td>
                  <td className="py-2 sm:py-4 px-2 sm:px-6 text-right">{user.isManager ? 'כן' : 'לא'}</td>
                </tr>
              )) : <tr><td colSpan="6" className="text-center py-2 sm:py-4 text-bg-navbar-custom">לא נמצאו משתמשים</td></tr>}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <button
              className="px-2 sm:px-4 py-1 sm:py-2 mx-1 sm:mx-2 rounded-lg bg-bg-hover text-bg-navbar-custom"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              {'<'}
            </button>
            {renderPageNumbers()}
            <button
              className="px-2 sm:px-4 py-1 sm:py-2 mx-1 sm:mx-2 rounded-lg bg-bg-hover text-bg-navbar-custom"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              {'>'}
            </button>
          </div>
        )}
        <div className="flex justify-center">
          <button
            onClick={exportToExcel}
            className="bg-bg-hover hover:bg-bg-hover text-bg-navbar-custom font-bold py-2 sm:py-3 px-4 sm:px-6 rounded"
          >
            ייצא לאקסל
          </button>
        </div>
      </div>
    </>
  );
};

export default AllUsersPage;
