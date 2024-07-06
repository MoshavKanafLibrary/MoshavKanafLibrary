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

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
          <FaSpinner className="animate-spin text-white text-6xl" />
        </div>
      )}
      <div className="container mx-auto px-4 py-8 max-w-7xl mt-10" dir="rtl">
        {successMessage && (
          <div className="mb-4 p-4 text-center text-white bg-green-500 rounded-lg">
            {successMessage}
          </div>
        )}
        <h1 className="text-5xl font-extrabold text-center mb-8 tracking-wide">כל הבקשות של המשתמשים</h1>
        <input
          type="text"
          className="w-full p-2 mb-4 text-lg"
          placeholder="חפש בקשות..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full bg-white rounded-lg shadow-lg">
            <thead className="bg-gray-800 text-white text-lg">
              <tr>
                <th className="py-4 px-6 text-right">UID</th>
                <th className="py-4 px-6 text-right">שם משתמש</th>
                <th className="py-4 px-6 text-right">בקשה</th>
                <th className="py-4 px-6 text-right">חותמת זמן</th>
                <th className="py-4 px-6 text-right">פעולות</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentRequests.length > 0 ? currentRequests.map((request, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-4 px-6 text-right">{request.uid}</td>
                  <td className="py-4 px-6 text-right">{request.username}</td>
                  <td className="py-4 px-6 text-right">{request.requestText}</td>
                  <td className="py-4 px-6 text-right">
                    {new Date(request.timestamp.seconds * 1000).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-right flex space-x-2">
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
              )) : <tr><td colSpan="5" className="text-center py-4">לא נמצאו בקשות</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center mb-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={`mx-1 px-4 py-2 rounded ${currentPage === i + 1 ? 'bg-gray-700 hover:bg-gray-800 text-white' : 'bg-gray-300 text-black'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default AllRequestsPage;
