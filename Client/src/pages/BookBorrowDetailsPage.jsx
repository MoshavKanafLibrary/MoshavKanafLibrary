import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

const BookBorrowDetailsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [copies, setCopies] = useState([]);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const bookTitle = location.state?.bookTitle; // This should be passed from the WaitingListPage

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full">
      <h1 className="text-5xl font-extrabold text-center mb-8 tracking-wide">Borrow Details for "{bookTitle}"</h1>
      {isLoading ? (
        <div className="flex justify-center items-center">
          <FaSpinner className="animate-spin text-6xl" />
        </div>
      ) : (
        copies.length > 0 ? copies.map((copy, index) => (
          <div key={index} className="bg-white p-4 w-full max-w-md rounded-lg shadow mb-4">
            <div><strong>Title:</strong> {copy.title}</div>
            <div><strong>Copy ID:</strong> {copy.copyID}</div>
            <div><strong>Status:</strong> {copy.borrowedTo ? `Borrowed to ${copy.borrowedTo}` : "Available"}</div>
          </div>
        )) : <div>No copies available for this book.</div>
      )}
      {error && <div className="text-red-500 p-3 rounded bg-gray-100 my-2">{error}</div>}
      <button onClick={() => navigate(-1)} className="mt-4 bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded">
        Go Back
      </button>
    </div>
  );
};

export default BookBorrowDetailsPage;
