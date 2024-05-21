import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSpinner, FaBell } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

const BookBorrowDetailsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [copies, setCopies] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
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
      // Get book ID using book title
      const bookResponse = await axios.get(`/api/books/names`);
      const book = bookResponse.data.bookNames.find(book => book.title === bookTitle);
  
      if (book) {
        // Remove the user from the waiting list by book ID
        const deleteRequestResponse = await axios.delete(`/api/books/${book.id}/waiting-list`, { data: { uid } });
        if (deleteRequestResponse.data.success) {
          console.log("Borrow request deleted successfully");
  
          // Update the borrow information
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
        } else {
          setError("Failed to delete borrow request.");
        }
      } else {
        setError("Book not found.");
      }
    } catch (error) {
      setError(`Error updating borrowedTo field: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleNotify = async () => {
    try {
      const response1 = await axios.post(`/api/users/${uid}/notifications`, {
        message: `The book "${bookTitle}" is ready for borrowing.`
      });
      const response2 = await axios.post(`/api/users/${uid}/send-email`, {
        message: `The book "${bookTitle}" is ready for borrowing.`
      });
      if ((response1.data.success) || (response1.data.success)) {
        setSuccessMessage("Notification sent successfully");
        setError(""); // Clear any previous error messages
      } else {
        setError("Failed to send notification.");
        setSuccessMessage(""); // Clear any previous success messages
      }
    } catch (error) {
      setError(`Error sending notification: ${error.response?.data?.message || error.message}`);
      setSuccessMessage(""); // Clear any previous success messages
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
                <div key={index} className="bg-white p-4 rounded-lg shadow mb-4" style={{ width: 'calc(40% - 16px)' }}>
                  <div><strong>Title:</strong> {copy.title}</div>
                  <div><strong>Copy ID:</strong> {copy.copyID}</div>
                  <div><strong>Status:</strong> {copy.borrowedTo ? `Borrowed to ${copy.borrowedTo}` : "Available"}</div>
                  {!copy.borrowedTo && (
                    <div className="flex flex-col">
                      <button
                        className="flex items-center justify-center mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded max-w-xs"
                        onClick={handleNotify}
                      >
                        <FaBell className="mr-2" />
                        Notify {displayName}!
                      </button>
                      <button
                        className="mt-4 bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded max-w-xs"
                        onClick={() => handleBorrow(copy.copyID)}
                      >
                        Borrow to {displayName}
                      </button>
                    </div>
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
      {successMessage && <div className="text-green-500 p-3 rounded bg-gray-100 my-2">{successMessage}</div>}
      <button onClick={() => navigate(-1)} className="mt-4 bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded">
        Go Back
      </button>
    </div>
  );
};

export default BookBorrowDetailsPage;
