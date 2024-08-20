import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSpinner, FaTrash, FaBell } from "react-icons/fa";

const AllRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [successMessage, setSuccessMessage] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get("/api/requests");
        if (response.data.success && Array.isArray(response.data.requests)) {
          setRequests(response.data.requests);
          setFilteredRequests(response.data.requests);
        } else {
          console.error("Unexpected data format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = requests.filter(request =>
      request.uid.toLowerCase().includes(lowerCaseQuery) ||
      request.username.toLowerCase().includes(lowerCaseQuery) ||
      request.requestText.toLowerCase().includes(lowerCaseQuery) ||
      new Date(request.timestamp.seconds * 1000).toLocaleString().toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredRequests(filtered);
    setCurrentPage(1); // Reset to first page on new search
  }, [searchQuery, requests]);

  const indexOfLastRequest = currentPage * itemsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const deleteRequest = async (id) => {
    try {
      setLoading(true);
      const response = await axios.delete(`/api/requests/${id}`);
      if (response.data.success) {
        setRequests(requests.filter(request => request.id !== id));
        setFilteredRequests(filteredRequests.filter(request => request.id !== id));
        setSuccessMessage("הבקשה נמחקה בהצלחה.");
      } else {
        console.error("Failed to delete request:", response.data.message);
      }
    } catch (error) {
      console.error("Error deleting request:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
    }
  };

  const notifyUser = async () => {
    try {
      setLoading(true);
      const message = `הספרית הגיבה על בקשתך: "${selectedUser.requestText}". התגובה של הספרית: "${customMessage}".`;
      const response = await axios.post(`/api/users/${selectedUser.uid}/notifications`, {
        message: message,
      });
      if (response.data.success) {
        setSuccessMessage("המשתמש קיבל התראה בהצלחה.");
        setSelectedUser(null); // נקה את המשתמש הנבחר לאחר שליחה
        setCustomMessage('');  // נקה את ההודעה המותאמת אישית
      } else {
        console.error("Failed to send notification:", response.data.message);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
    }
  };

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
          className={`px-2 py-1 sm:px-4 sm:py-2 mx-1 rounded-lg ${i === currentPage ? 'bg-bg-hover text-bg-navbar-custom' : 'bg-bg-hover text-bg-navbar-custom'}`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
          <FaSpinner className="animate-spin text-white text-4xl sm:text-6xl" />
        </div>
      )}
      <div className="container mx-auto px-4 py-8 max-w-7xl mt-10" dir="rtl">
        {successMessage && (
          <div className="mb-4 p-4 text-center text-white bg-green-500 rounded-lg">
            {successMessage}
          </div>
        )}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-center mb-8 tracking-wide text-bg-navbar-custom">כל הבקשות של המשתמשים</h1>
        <input
          type="text"
          className="w-full p-2 sm:p-3 mb-4 text-base sm:text-lg bg-bg-navbar-custom text-bg-text"
          placeholder="חפש בקשות..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full bg-bg-navbar-custom rounded-lg shadow-lg text-sm sm:text-base">
            <thead className="bg-bg-text text-bg-navbar-custom text-sm sm:text-lg">
              <tr>
                <th className="py-2 sm:py-4 px-2 sm:px-6 text-right">UID</th>
                <th className="py-2 sm:py-4 px-2 sm:px-6 text-right">שם משתמש</th>
                <th className="py-2 sm:py-4 px-2 sm:px-6 text-right">בקשה</th>
                <th className="py-2 sm:py-4 px-2 sm:px-6 text-right">חותמת זמן</th>
                <th className="py-2 sm:py-4 px-2 sm:px-6 text-right">פעולות</th>
              </tr>
            </thead>
            <tbody className="text-bg-text">
              {currentRequests.length > 0 ? currentRequests.map((request, index) => (
                <tr key={index} className="border-b border-bg-text hover:bg-bg-hover hover:text-bg-navbar-custom">
                  <td className="py-2 sm:py-4 px-2 sm:px-6 text-right">{request.uid}</td>
                  <td className="py-2 sm:py-4 px-2 sm:px-6 text-right">{request.username}</td>
                  <td className="py-2 sm:py-4 px-2 sm:px-6 text-right">{request.requestText}</td>
                  <td className="py-2 sm:py-4 px-2 sm:px-6 text-right">
                    {new Date(request.timestamp.seconds * 1000).toLocaleString()}
                  </td>
                  <td className="py-2 sm:py-4 px-2 sm:px-6 text-right flex space-x-2 justify-center">
                    <button
                      onClick={() => setSelectedUser(request)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FaBell />
                    </button>
                    <button
                      onClick={() => deleteRequest(request.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              )) : <tr><td colSpan="5" className="text-center py-2 sm:py-4 text-bg-navbar-custom">לא נמצאו בקשות</td></tr>}
            </tbody>
          </table>
        </div>
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
      </div>
      
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg max-w-md w-full" dir="rtl">
            <h2 className="text-xl sm:text-2xl mb-4">שלח הודעה למשתמש {selectedUser.username}</h2>
            <textarea
              className="w-full p-2 border rounded-lg mb-4"
              rows="4"
              placeholder="הקלד את ההודעה כאן..."
              value={customMessage}
              onChange={e => setCustomMessage(e.target.value)}
              dir="rtl"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setCustomMessage('');
                }}
                className="px-2 sm:px-4 py-1 sm:py-2 bg-gray-300 rounded-lg"
              >
                בטל
              </button>
              <button
                onClick={notifyUser}
                className="px-2 sm:px-4 py-1 sm:py-2 bg-blue-500 text-white rounded-lg"
              >
                שלח
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AllRequestsPage;
