import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";

const AllRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
          <FaSpinner className="animate-spin text-white text-6xl" />
        </div>
      )}
      <div className="container mx-auto px-4 py-8 max-w-7xl mt-10">
        <h1 className="text-5xl font-extrabold text-center mb-8 tracking-wide">All User Requests</h1>
        <input
          type="text"
          className="w-full p-2 mb-4 text-lg"
          placeholder="Search requests..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full bg-white rounded-lg shadow-lg">
            <thead className="bg-gray-800 text-white text-lg">
              <tr>
                <th className="py-4 px-6 text-left">UID</th>
                <th className="py-4 px-6 text-left">Username</th>
                <th className="py-4 px-6 text-left">Request</th>
                <th className="py-4 px-6 text-left">Timestamp</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentRequests.length > 0 ? currentRequests.map((request, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-4 px-6 text-left">{request.uid}</td>
                  <td className="py-4 px-6 text-left">{request.username}</td>
                  <td className="py-4 px-6 text-left">{request.requestText}</td>
                  <td className="py-4 px-6 text-left">
                    {new Date(request.timestamp.seconds * 1000).toLocaleString()}
                  </td>
                </tr>
              )) : <tr><td colSpan="4" className="text-center py-4">No requests found</td></tr>}
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
