import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSpinner, FaTimes, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const PresentBooksPage = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/books/getAllBooksData")
      .then(response => {
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

  const indexOfLastBook = currentPage * itemsPerPage;
  const indexOfFirstBook = indexOfLastBook - itemsPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDelete = async (bookId) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את הספר?')) {
      try {
          await axios.delete(`/api/books/${bookId}`);
          const updatedBooks = books.filter(book => book.id !== bookId);
          setBooks(updatedBooks);
          setFilteredBooks(updatedBooks);
          setSuccessMessage('הספר נמחק בהצלחה');
      } catch (error) {
          console.error('שגיאה במחיקת הספר:', error);
          alert('נכשל במחיקת הספר');
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
      <div className="container mx-auto px-4 py-8 max-w-7xl mt-10 " dir="rtl">
        <h1 className="text-5xl font-extrabold text-center mb-8 tracking-wide">אוסף הספרים שלנו</h1>
        {successMessage && (
          <div className="text-center py-3 px-4 bg-green-200 text-green-800 font-bold rounded-lg">
            {successMessage}
          </div>
        )}
        <input
          type="text"
          className="w-full p-2 mb-4 text-lg"
          placeholder="חפש ספרים..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-lg">
            <thead className="bg-gray-800 text-white text-lg">
              <tr>
                <th className="py-4 px-6 text-right">כותרת</th>
                <th className="py-4 px-6 text-right">מחבר</th>
                <th className="py-4 px-6 text-right">סיווג</th>
                <th className="py-4 px-6 text-right">עותקים</th>
                <th className="py-4 px-6 text-right">הוצאה</th>
                <th className="py-4 px-6 text-right">קוד מיקום</th>
                <th className="py-4 px-6 text-right">סוג כותרת</th>
                <th className="py-4 px-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentBooks.length > 0 ? currentBooks.map((book, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-100 relative">
                  <td className="py-4 px-6 text-right">{book.title}</td>
                  <td className="py-4 px-6 text-right">{book.author}</td>
                  <td className="py-4 px-6 text-right">{book.classification}</td>
                  <td className="py-4 px-6 text-right">{book.copies}</td>
                  <td className="py-4 px-6 text-right">{book.expenditure}</td>
                  <td className="py-4 px-6 text-right">{book.locatorCode}</td>
                  <td className="py-4 px-6 text-right">{book.titleType}</td>
                  <td className="py-4 px-6 text-right">
                    <button onClick={() => handleUpdate(book)} className="text-green-500 hover:text-green-700 mr-2">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(book.id)} className="text-red-500 hover:text-red-700">
                      <FaTimes />
                    </button>
                  </td>
                </tr>
              )) : <tr><td colSpan="8" className="text-center py-4">לא נמצאו ספרים</td></tr>}
            </tbody>
          </table>
        </div>
        {/* Pagination controls */}
        <div className="flex justify-center mt-4">
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
        <div className="flex justify-center mt-4">
        </div>
      </div>
    </>
  );
};

export default PresentBooksPage;
