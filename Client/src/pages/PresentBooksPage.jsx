import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSpinner, FaTimes, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const PresentBooksPage = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/books/getAllBooksData")
      .then(response => {
        console.log("Data received:", response.data);
        if (response.data.success && Array.isArray(response.data.books)) {
          setBooks(response.data.books);
          setFilteredBooks(response.data.books);
        } else {
          console.error("Unexpected data format:", response.data);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching books:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = books.filter(book =>
      book.title.toLowerCase().includes(lowerCaseQuery) ||
      book.author.toLowerCase().includes(lowerCaseQuery) ||
      book.classification.toLowerCase().includes(lowerCaseQuery) ||
      book.locatorCode.toLowerCase().includes(lowerCaseQuery) ||
      book.titleType.toLowerCase().includes(lowerCaseQuery) ||
      book.copies.toString().includes(lowerCaseQuery) ||
      book.expenditure.toString().includes(lowerCaseQuery)
    );
    setFilteredBooks(filtered);
  }, [searchQuery, books]);

  const handleDelete = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
        try {
            await axios.delete(`/api/books/${bookId}`);
            const updatedBooks = books.filter(book => book.id !== bookId);
            setBooks(updatedBooks);
            setFilteredBooks(updatedBooks);
            console.log('Book deleted successfully');
            alert('The book was deleted successfully'); // Popup message
        } catch (error) {
            console.error('Error deleting the book:', error);
            alert('Failed to delete the book'); // Popup message for failure
        }
    }
  };

  const handleUpdate = (book) => {
    navigate(`/addOrUpdateBook/${book.id}`, { state: { bookData: book } });
  };

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
          <FaSpinner className="animate-spin text-white text-6xl" />
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-7xl mt-10">
        <h1 className="text-4xl font-bold text-center mb-8">Book List</h1>
        <input
          type="text"
          className="w-full p-2 mb-4 text-lg"
          placeholder="Search books..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-lg">
            <thead className="bg-gray-800 text-white text-lg">
              <tr>
                <th className="py-4 px-6 text-left">Title</th>
                <th className="py-4 px-6 text-left">Author</th>
                <th className="py-4 px-6 text-left">Classification</th>
                <th className="py-4 px-6 text-left">Copies</th>
                <th className="py-4 px-6 text-left">Expenditure</th>
                <th className="py-4 px-6 text-left">Locator Code</th>
                <th className="py-4 px-6 text-left">Title Type</th>
                <th className="py-4 px-6 text-left"></th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {filteredBooks.length > 0 ? filteredBooks.map((book, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-100 relative">
                  <td className="py-4 px-6 text-left">{book.title}</td>
                  <td className="py-4 px-6 text-left">{book.author}</td>
                  <td className="py-4 px-6 text-left">{book.classification}</td>
                  <td className="py-4 px-6 text-left">{book.copies}</td>
                  <td className="py-4 px-6 text-left">{book.expenditure}</td>
                  <td className="py-4 px-6 text-left">{book.locatorCode}</td>
                  <td className="py-4 px-6 text-left">{book.titleType}</td>
                  <td className="py-4 px-6 text-left">
                    <button onClick={() => handleUpdate(book)} className="text-green-500 hover:text-green-700 mr-2">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(book.id)} className="text-red-500 hover:text-red-700">
                      <FaTimes />
                    </button>
                  </td>
                </tr>
              )) : <tr><td colSpan="8" className="text-center py-4">No books found</td></tr>}
            </tbody>
          </table>
        </div>
        {/* Button to go back to ManagerPage, centered */}
<div className="flex justify-center mt-4">
  <button
    onClick={() => navigate("/manager")} // Navigate back to ManagerPage
    className="bg-gray-700 hover:bg-gray-800 text-gray-50 font-bold py-3 px-6 rounded"
  >
    Go Back to ManagerPage
  </button>
</div>

      </div>
    </>
  );
};

export default PresentBooksPage;
