import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';
import useUser from '../hooks/useUser'; // Import the custom hook to get the user

const BorrowedCopiesPage = () => {
  const { user } = useUser(); // Get the user object
  const [borrowedCopies, setBorrowedCopies] = useState([]);
  const [filteredCopies, setFilteredCopies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    axios.get("/api/copies/borrowed")
      .then(response => {
        if (response.data.success && Array.isArray(response.data.borrowedCopies)) {
          setBorrowedCopies(response.data.borrowedCopies);
          setFilteredCopies(response.data.borrowedCopies);
        } else {
          console.error("Unexpected data format:", response.data);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching borrowed copies:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = borrowedCopies.filter(copy =>
      copy.title.toLowerCase().includes(lowerCaseQuery) ||
      copy.borrowedTo.toLowerCase().includes(lowerCaseQuery) ||
      copy.copyID.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredCopies(filtered);
  }, [searchQuery, borrowedCopies]);

  const indexOfLastCopy = currentPage * itemsPerPage;
  const indexOfFirstCopy = indexOfLastCopy - itemsPerPage;
  const currentCopies = filteredCopies.slice(indexOfFirstCopy, indexOfLastCopy);

  const totalPages = Math.ceil(filteredCopies.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const returnCopy = async (copyID, title) => {
    if (!user) {
      setErrorMessage("User is not logged in.");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to return this book?");
    if (confirmed) {
      try {
        const response = await axios.put('/api/copies/returnCopy', { copyID });
        if (response.data.success) {
          // Remove the returned copy from both borrowedCopies and filteredCopies
          setBorrowedCopies(prevCopies => prevCopies.filter(copy => copy.copyID !== copyID));
          setFilteredCopies(prevCopies => prevCopies.filter(copy => copy.copyID !== copyID));
          setSuccessMessage("Book returned successfully.");

          // Add the returned book to the user's history
          await axios.put(`/api/users/${user.uid}/addToHistory`, { copyID, title });

          // Delete the book entry from the borrowBooks-list
          const deleteBorrowListResponse = await axios.delete(`/api/users/${user.uid}/borrow-books-list/deletebookfromborrowlist`, { data: { title } });
          if (deleteBorrowListResponse.data.success) {
            console.log("Book entry deleted from borrowBooks-list successfully");
          } else {
            setErrorMessage("Failed to delete book entry from borrowBooks-list.");
          }

          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          setErrorMessage("Failed to update borrowedTo field.");
        }
      } catch (error) {
        console.error("Error returning copy:", error.response ? error.response.data : error.message);
        setErrorMessage("Error returning copy: " + (error.response ? error.response.data.message : error.message));
      }
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
          <FaSpinner className="animate-spin text-white text-6xl" />
        </div>
      )}
      <div className="container mx-auto px-4 py-8 max-w-7xl mt-10">
        <h1 className="text-5xl font-extrabold text-center mb-8 tracking-wide">Borrowed Copies</h1>
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline"> {successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {errorMessage}</span>
          </div>
        )}
        <input
          type="text"
          className="w-full p-2 mb-4 text-lg"
          placeholder="Search borrowed copies..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full bg-white rounded-lg shadow-lg">
            <thead className="bg-gray-800 text-white text-lg">
              <tr>
                <th className="py-4 px-6 text-left">Title</th>
                <th className="py-4 px-6 text-left">Borrowed To</th>
                <th className="py-4 px-6 text-left">Copy ID</th>
                <th className="py-4 px-6 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentCopies.length > 0 ? currentCopies.map((copy, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-4 px-6 text-left">{copy.title}</td>
                  <td className="py-4 px-6 text-left">{copy.borrowedTo}</td>
                  <td className="py-4 px-6 text-left">{copy.copyID}</td>
                  <td className="py-4 px-6 text-left">
                    <button
                      onClick={() => returnCopy(copy.copyID, copy.title)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Return
                    </button>
                  </td>
                </tr>
              )) : <tr><td colSpan="4" className="text-center py-4">No borrowed copies found</td></tr>}
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

export default BorrowedCopiesPage;
