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
    const bookId = e.target.value; // Get the selected book ID
    setSelectedBook(bookId); // Update the selected book ID

    if (bookId) {
      try {
        const response = await axios.get(`/api/books/${bookId}`); // Fetch the selected book's data by ID
        if (response.data.success) {
          const bookData = response.data.bookData;
          navigate("/AddOrUpdateBook", { state: { bookData: { id: bookId, ...bookData } } }); // Navigate to update the book with its data
        } else {
          setError("Error fetching book data: " + response.data.message);
        }
      } catch (error) {
        setError("Error fetching book data: " + error.message);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-gray-50">
      <div className="bg-bg-navbar-custom shadow-2xl rounded-lg md:px-16 px-4 pt-10 pb-12 w-full sm:w-3/4 lg:w-1/2">
        <h1 className="text-3xl text-center font-bold">Welcome back!</h1>
        <p className="text-lg text-center mb-6">What would you like to do today?</p>

        <div className="flex flex-col items-center space-y-4">
          {/* Button to add a new book */}
          <button
            className="bg-green-600 hover:bg-blue-700 text-gray-50 font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline"
            onClick={handleAddNewBook} // Navigate to add a new book
          >
            Add a New Book
          </button>

          {/* Dropdown to select a book to update */}
          <div className="flex flex-col items-center">
            <select
              className="bg-gray-700 shadow border rounded py-2 px-4 text-gray-50 leading-tight focus:outline-none focus:shadow-outline"
              value={selectedBook} // Set to the selected book
              onChange={handleUpdateBook} // Handle book change for updating
            >
              <option value="">Update a Book</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title}
                </option>
              ))}
            </select>
          </div>

          {/* Display error messages if any */}
          {error && (
            <p className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded text-center">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerPage;
