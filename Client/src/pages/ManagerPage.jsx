import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import axios from "axios"; // For making HTTP requests

const ManagerPage = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(""); // Track selected book ID
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get("/api/books/names"); // Get all book names from the server
        if (response.data.success) {
          setBooks(response.data.bookNames); // Set the list of books
        } else {
          setError("Failed to fetch book names: " + response.data.message);
        }
      } catch (e) {
        setError("Error fetching books: " + e.message);
      }
    };

    fetchBooks(); // Fetch books on component mount
  }, []);

  const handleAddNewBook = () => {
    navigate("/AddOrUpdateBook", { state: {} }); // Navigate to add a new book with empty state
  };

  const handleUpdateBook = async (e) => {
    navigate("/searchBook", { state: { mode: 1 } });
  }

  const handleOrderBook = async (e) => {
    navigate("/searchBook", { state: { mode: 0} });
  }
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-50">
      
      <div className="bg-gray-700 shadow-2xl rounded-lg md:px-20 px-8 pt-24 pb-24 w-full sm:w-3/4 lg:w-1/2">
        <h1 className="text-4xl text-center font-bold mb-4">Welcome back!</h1>
        <p className="text-xl text-center mb-8">What would you like to do today?</p>

        <div className="flex flex-col items-center space-y-6">
          <button
            className="w-56 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-100 text-black font-bold py-4 px-8 rounded focus:outline-none focus:shadow-outline hover:from-gray-400 hover:via-gray-300 hover:to-gray-200"
            onClick={handleAddNewBook}
          >
            Add a New Book
          </button>

          <button
            className="w-56 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-100 text-black font-bold py-4 px-8 rounded focus:outline-none focus:shadow-outline hover:from-gray-400 hover:via-gray-300 hover:to-gray-200"
            onClick={handleUpdateBook}
          >
            Update a Book
          </button>

          <button
            className="w-56 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-100 text-black font-bold py-4 px-8 rounded focus:outline-none focus:shadow-outline hover:from-gray-400 hover:via-gray-300 hover:to-gray-200"
            onClick={handleOrderBook}
          >
            Order a book
          </button>


          <button
            className="w-56 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-100 text-black font-bold py-4 px-8 rounded focus:outline-none focus:shadow-outline hover:from-gray-400 hover:via-gray-300 hover:to-gray-200"
          >
            Borrow Requests
          </button>

          <button
            className="w-56 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-100 text-black font-bold py-4 px-8 rounded focus:outline-none focus:shadow-outline hover:from-gray-400 hover:via-gray-300 hover:to-gray-200"
          >
            Open new Borrow request for user
          </button>

          <button
            className="w-56 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-100 text-black font-bold py-4 px-8 rounded focus:outline-none focus:shadow-outline hover:from-gray-400 hover:via-gray-300 hover:to-gray-200"
          >
            Print Books Reports
          </button>

          {/* Display error messages if any */}
          {error && (
            <p className="text-lg bg-red-100 border border-red-400 text-red-700 px-8 py-6 rounded text-center">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerPage;
