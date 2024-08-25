import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';
import useUser from '../hooks/useUser'; // Import the custom hook to get the user

const BorrowedCopiesPage = () => {
  const { user } = useUser(); // Get the user object
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    axios.get("/api/borrowed-books-details")
      .then(response => {
        if (response.data.success && Array.isArray(response.data.borrowedBooks)) {
          setBorrowedBooks(response.data.borrowedBooks);
          setFilteredBooks(response.data.borrowedBooks);
        } else {
          console.error("Unexpected data format:", response.data);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching borrowed books details:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = borrowedBooks.filter(book =>
      (book.title && book.title.toLowerCase().includes(lowerCaseQuery)) ||
      (book.uid && book.uid.toLowerCase().includes(lowerCaseQuery)) ||
      (book.firstName && book.firstName.toLowerCase().includes(lowerCaseQuery)) ||
      (book.lastName && book.lastName.toLowerCase().includes(lowerCaseQuery)) ||
      (book.email && book.email.toLowerCase().includes(lowerCaseQuery)) ||
      (book.copyID && book.copyID.toString().includes(lowerCaseQuery)) // Include copyID in search
    );
    setFilteredBooks(filtered);
    setCurrentPage(1); // Reset to first page on new search
  }, [searchQuery, borrowedBooks]);

  const indexOfLastBook = currentPage * itemsPerPage;
  const indexOfFirstBook = indexOfLastBook - itemsPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const returnCopy = async (copyID, title, borrowerUID) => {
    if (!user) {
      setErrorMessage("User is not logged in.");
      return;
    }
  
    const confirmed = window.confirm("Are you sure you want to return this book?");
    if (confirmed) {
      try {
        const response = await axios.put('/api/copies/returnCopy', { copyID, borrowerUID });
        if (response.data.success) {
          setBorrowedBooks(prevBooks => prevBooks.filter(book => book.copyID !== copyID));
          setFilteredBooks(prevBooks => prevBooks.filter(book => book.copyID !== copyID));
          setSuccessMessage("Book returned successfully.");
  
          await axios.put(`/api/users/${borrowerUID}/addToHistory`, { copyID, title });
  
          const deleteBorrowListResponse = await axios.delete(`/api/users/${borrowerUID}/borrow-books-list/deletebookfromborrowlist`, { data: { title } });
          if (deleteBorrowListResponse.data.success) {
            console.log("Book entry deleted from borrow-books-list successfully");
          } else {
            setErrorMessage("Failed to delete book entry from borrow-books-list.");
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

  const renderPageNumbers = () => {
    const pages = [];
    const maxPageNumbersToShow = 5;
    const halfRange = Math.floor(maxPageNumbersToShow / 2);
    let startPage = Math.max(currentPage - halfRange, 1);
    let endPage = Math.min(startPage + maxPageNumbersToShow - 1, totalPages);

    if (endPage - startPage < maxPageNumbersToShow - 1) {
      startPage = Math.max(endPage - maxPageNumbersToShow + 1, 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => paginate(i)}
          className={`px-2 py-1 sm:px-4 sm:py-2 mx-1 sm:mx-2 rounded-lg ${i === currentPage ? 'bg-bg-header-custom text-black' : 'bg-bg-header-custom text-black hover:bg-bg-hover hover:text-white'}`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
          <FaSpinner className="animate-spin text-white text-4xl sm:text-6xl" />
        </div>
      )}
      <div className="container mx-auto px-4 py-8 max-w-7xl mt-10 " dir="rtl">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-center mb-8 tracking-wide text-bg-navbar-custom">עותקים מושאלים</h1>
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 sm:px-4 sm:py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline"> {successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {errorMessage}</span>
          </div>
        )}
        <input
          type="text"
          className="w-full p-2 sm:p-3 mb-4 text-base sm:text-lg bg-bg-navbar-custom text-bg-text"
          placeholder="חפש עותקים מושאלים..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full bg-bg-navbar-custom rounded-lg shadow-lg text-sm sm:text-base">
            <thead className="bg-bg-text text-bg-navbar-custom text-sm sm:text-lg">
              <tr>
                <th className="py-2 sm:py-4 px-2 sm:px-6 text-right">כותר</th>
                <th className="py-2 sm:py-4 px-2 sm:px-6 text-right">שם משאיל</th>
                <th className="py-2 sm:py-4 px-2 sm:px-6 text-right">מייל</th>
                <th className="py-2 sm:py-4 px-2 sm:px-6 text-right">מזהה עותק</th>
                <th className="py-2 sm:py-4 px-2 sm:px-6 text-right">תאריך בקשה</th>
                <th className="py-2 sm:py-4 px-2 sm:px-6 text-right">תאריך התחלה</th>
                <th className="py-2 sm:py-4 px-2 sm:px-6 text-right">תאריך סיום</th>
                <th className="py-2 sm:py-4 px-2 sm:px-6 text-right">פעולות</th>
              </tr>
            </thead>
            <tbody className="text-bg-text">
              {currentBooks.length > 0 ? currentBooks.map((book, index) => (
                <tr key={index} className="border-b border-bg-text hover:bg-bg-hover hover:text-bg-navbar-custom">
                  <td className="py-2 sm:py-4 px-2 sm:px-6 text-right">{book.title}</td>
                  <td className="py-2 sm:py-4 px-2 sm:px-6 text-right">{`${book.firstName} ${book.lastName}`}</td>
                  <td className="py-2 sm:py-4 px-2 sm:px-6 text-right">{book.email}</td>
                  <td className="py-2 sm:py-4 px-2 sm:px-6 text-right">{book.copyID}</td>
                  <td className="py-2 sm:py-4 px-2 sm:px-6 text-right">{book.requestDate}</td>
                  <td className="py-2 sm:py-4 px-2 sm:px-6 text-right">{book.startDate}</td>
                  <td className="py-2 sm:py-4 px-2 sm:px-6 text-right">{book.endDate}</td>
                  <td className="py-2 sm:py-4 px-2 sm:px-6 text-right">
                    <button
                      onClick={() => returnCopy(book.copyID, book.title, book.uid)}
                      className="bg-red-500 hover:bg-red-700 text-bg-navbar-custom font-bold py-1 sm:py-2 px-2 sm:px-4 rounded"
                    >
                      החזרה
                    </button>
                  </td>
                </tr>
              )) : <tr><td colSpan="8" className="text-center py-2 sm:py-4 text-bg-navbar-custom">לא נמצאו עותקים מושאלים</td></tr>}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <button
              className="px-2 sm:px-4 py-1 sm:py-2 mx-1 sm:mx-2 rounded-lg bg-bg-hover text-bg-navbar-custom"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              {'<'}
            </button>
            {renderPageNumbers()}
            <button
              className="px-2 sm:px-4 py-1 sm:py-2 mx-1 sm:mx-2 rounded-lg bg-bg-hover text-bg-navbar-custom"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              {'>'}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default BorrowedCopiesPage;
