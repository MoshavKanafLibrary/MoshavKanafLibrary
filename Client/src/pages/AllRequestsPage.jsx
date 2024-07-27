import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSpinner, FaTrash, FaBell, FaArrowLeft, FaArrowRight } from "react-icons/fa";

const AllRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [successMessage, setSuccessMessage] = useState('');

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

  const notifyUser = async (uid) => {
    try {
      setLoading(true);
      const response = await axios.post(`/api/users/${uid}/notifications`, {
        message: "תודה על בקשת הספר שלך!",
      });
      if (response.data.success) {
        setSuccessMessage("המשתמש קיבל התראה בהצלחה.");
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
          className={`px-4 py-2 mx-1 rounded-lg ${i === currentPage ? 'bg-[#8B0000] text-[#E7DBCB]' : 'bg-[#4B0000] text-[#E7DBCB]'}`}
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
          <FaSpinner className="animate-spin text-white text-6xl" />
        </div>
      )}
      <div className="container mx-auto px-4 py-8 max-w-7xl mt-10 bg-gradient-to-br from-[#4B0000] via-[#8B0000] to-[#4B0000]" dir="rtl">
        {successMessage && (
          <div className="mb-4 p-4 text-center text-white bg-green-500 rounded-lg">
            {successMessage}
          </div>
        )}
        <h1 className="text-5xl font-extrabold text-center mb-8 tracking-wide text-[#E7DBCB]">כל הבקשות של המשתמשים</h1>
        <input
          type="text"
          className="w-full p-2 mb-4 text-lg bg-[#E7DBCB] text-[#7C382A]"
          placeholder="חפש בקשות..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full bg-[#E7DBCB] rounded-lg shadow-lg">
            <thead className="bg-[#7C382A] text-[#E7DBCB] text-lg">
              <tr>
                <th className="py-4 px-6 text-right">UID</th>
                <th className="py-4 px-6 text-right">שם משתמש</th>
                <th className="py-4 px-6 text-right">בקשה</th>
                <th className="py-4 px-6 text-right">חותמת זמן</th>
                <th className="py-4 px-6 text-right">פעולות</th>
              </tr>
            </thead>
            <tbody className="text-[#7C382A]">
              {currentRequests.length > 0 ? currentRequests.map((request, index) => (
                <tr key={index} className="border-b border-[#7C382A] hover:bg-[#8B0000] hover:text-[#E7DBCB]">
                  <td className="py-4 px-6 text-right">{request.uid}</td>
                  <td className="py-4 px-6 text-right">{request.username}</td>
                  <td className="py-4 px-6 text-right">{request.requestText}</td>
                  <td className="py-4 px-6 text-right">
                    {new Date(request.timestamp.seconds * 1000).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-right flex space-x-2 justify-center">
                    <button
                      onClick={() => notifyUser(request.uid)}
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
              )) : <tr><td colSpan="5" className="text-center py-4 text-[#E7DBCB]">לא נמצאו בקשות</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center mt-8">
          <button
            className="px-4 py-2 mx-2 rounded-lg bg-[#4B0000] text-[#E7DBCB]"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            {'<'}
          </button>
          {renderPageNumbers()}
          <button
            className="px-4 py-2 mx-2 rounded-lg bg-[#4B0000] text-[#E7DBCB]"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            {'>'}
          </button>
        </div>
      </div>
    </>
  );
};

export default AllRequestsPage;
