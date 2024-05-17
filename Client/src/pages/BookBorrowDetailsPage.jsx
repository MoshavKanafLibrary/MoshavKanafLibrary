import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

const BookBorrowDetailsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [copies, setCopies] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // Defines the number of items per page

  const navigate = useNavigate();
  const location = useLocation();
  const bookTitle = location.state?.bookTitle;
  const displayName = location.state?.displayName;
  const uid = location.state?.uid;

  useEffect(() => {
    const fetchCopies = async () => {
      try {
        const response = await axios.get(`/api/book/getCopiesByTitle`, { params: { title: bookTitle } });
        if (response.status === 200 && response.data.copies) {
          setCopies(response.data.copies);
        } else {
          setError("No copies found for this title.");
        }
      } catch (error) {
        setError(`Failed to fetch copies: ${error.response?.data?.message || error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (bookTitle) {
      fetchCopies();
    }
  }, [bookTitle]);

  const handleBorrow = async (copyID) => {
    try {
      const updateBorrowResponse = await axios.put('/api/copies/updateBorrowedTo', { copyID, uid, title: bookTitle });
      if (updateBorrowResponse.data.success) {
        setCopies(prevCopies => prevCopies.map(copy => {
          if (copy.copyID === copyID) {
            return { ...copy, borrowedTo: displayName };
          }
          return copy;
        }));

        // Update the status in the user's borrowBooks-list
        const updateStatusResponse = await axios.put(`/api/users/${uid}/borrow-books-list/update-status`, { title: bookTitle });
        if (updateStatusResponse.data.success) {
          console.log("Borrow books list status updated successfully");
        } else {
          setError("Failed to update borrow books list status.");
        }
      } else {
        setError("Failed to update borrowedTo field.");
      }
    } catch (error) {
      setError(`Error updating borrowedTo field: ${error.response?.data?.message || error.message}`);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = copies.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = pageNumber => setCurrentPage(pageNumber);
  const total_pages = Math.ceil(copies.length / itemsPerPage);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full">
      <h1 className="text-5xl font-extrabold text-center mb-8 tracking-wide">Borrow Details for "{bookTitle}"</h1>
      {isLoading ? (
        <div className="flex justify-center items-center">
          <FaSpinner className="animate-spin text-6xl" />
        </div>
      ) : (
        <>
          {copies.length > 0 ? (
            <div className="w-full px-4 flex flex-wrap justify-center gap-4">
              {currentItems.map((copy, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow mb-4" style={{ width: 'calc(40% - 16px)' }}> {/* Adjusted width for each item */}
                  <div><strong>Title:</strong> {copy.title}</div>
                  <div><strong>Copy ID:</strong> {copy.copyID}</div>
                  <div><strong>Status:</strong> {copy.borrowedTo ? `Borrowed to ${copy.borrowedTo}` : "Available"}</div>
                  {!copy.borrowedTo && (
                    <button
                      className="mt-4 bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
                      onClick={() => handleBorrow(copy.copyID)}
                    >
                      Borrow to {displayName}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div>No copies available for this book.</div>
          )}
          <div className="flex justify-center mt-4">
            {Array.from({ length: total_pages }, (_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`mx-2 px-4 py-2 rounded ${currentPage === index + 1 ? 'bg-gray-700 hover:bg-gray-800 text-white' : 'bg-gray-300'}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </>
      )}
      {error && <div className="text-red-500 p-3 rounded bg-gray-100 my-2">{error}</div>}
      <button onClick={() => navigate(-1)} className="mt-4 bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded">
        Go Back
      </button>
    </div>
  );
};

export default BookBorrowDetailsPage;
