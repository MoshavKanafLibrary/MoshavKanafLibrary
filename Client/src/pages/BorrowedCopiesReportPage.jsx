import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';
import * as XLSX from 'xlsx';
/*
 * BorrowedCopiesReportPage component displays a report of borrowed book copies with search and pagination features.
 * It fetches the borrowed books data from the server and allows users to filter the results based on search queries.
 * Users can export the filtered data to an Excel file for further analysis.
 * The component supports pagination and displays a loader while the data is being fetched.
 */
const BorrowedCopiesReportPage = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const getBorrowedBooksDetails = async () => {
      try {
        const response = await axios.get('/api/borrowed-books-details');
        if (response.data.success && Array.isArray(response.data.borrowedBooks)) {
          setBorrowedBooks(response.data.borrowedBooks);
          setFilteredBooks(response.data.borrowedBooks);
        } else {
          console.error('Unexpected data format:', response.data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching borrowed books details:', error);
        setLoading(false);
      }
    };

    getBorrowedBooksDetails();
  }, []);

  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = borrowedBooks.filter(book =>
      (book.title && book.title.toLowerCase().includes(lowerCaseQuery)) ||
      (book.uid && book.uid.toLowerCase().includes(lowerCaseQuery)) ||
      (book.firstName && book.firstName.toLowerCase().includes(lowerCaseQuery)) ||
      (book.lastName && book.lastName.toLowerCase().includes(lowerCaseQuery)) ||
      (book.email && book.email.toLowerCase().includes(lowerCaseQuery)) ||
      (book.copyID && String(book.copyID).toLowerCase().includes(lowerCaseQuery))
    );
    setFilteredBooks(filtered);
    setCurrentPage(1); // Reset to first page on new search
  }, [searchQuery, borrowedBooks]);

  const indexOfLastBook = currentPage * itemsPerPage;
  const indexOfFirstBook = indexOfLastBook - itemsPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
          className={`px-2 sm:px-4 py-1 sm:py-2 mx-1 sm:mx-2 rounded-lg ${i === currentPage ? 'bg-bg-hover text-bg-navbar-custom' : 'bg-bg-hover text-bg-navbar-custom'}`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  const exportToExcel = () => {
    // Prepare the data for export
    const dataForExport = filteredBooks.map(book => ({
      מזהה_עותק: book.copyID,
      תאריך_סיום: book.endDate,
      תאריך_התחלה: book.startDate,
      תאריך_בקשה: book.requestDate,
      מייל: book.email,
      קוד_משתמש: book.random,
      כמות_נפשות: book.familySize,
      שם_משאיל: `${book.firstName} ${book.lastName}`,
      כותר: book.title
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Borrowed Books');
    XLSX.writeFile(workbook, 'borrowed_books_report.xlsx');
  };

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
          <FaSpinner className="animate-spin text-white text-4xl sm:text-6xl" />
        </div>
      )}
      <div className="container mx-auto px-4 py-8 max-w-7xl mt-10" dir="rtl">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-center mb-8 tracking-wide text-bg-navbar-custom">דוח ספרים מושאלים</h1>
        <input
          type="text"
          className="w-full p-2 sm:p-3 mb-4 text-base sm:text-lg bg-bg-navbar-custom text-bg-text"
          placeholder="חפש ספרים מושאלים..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full bg-bg-navbar-custom rounded-lg shadow-lg text-sm sm:text-base">
            <thead className="bg-bg-text text-bg-navbar-custom text-sm sm:text-lg">
              <tr>
                <th className="py-2 sm:py-4 px-2 sm:px-6 text-right">כותר</th>
                <th className="py-2 sm:py-4 px-2 sm:px-6 text-right">מזהה עותק</th> 
                <th className="py-2 sm:py-4 px-2 sm:px-6 text-right">שם משאיל</th>
                <th className="py-2 sm:py-4 px-2 sm:px-6 text-right">כמות נפשות במשפחה</th>
                <th className="py-2 sm:py-4 px-2 sm:px-6 text-right">קוד משתמש</th>
                <th className="py-2 sm:py-4 px-2 sm:px-6 text-right">מייל</th>
                <th className="py-2 sm:py-4 px-2 sm:px-6 text-right">תאריך בקשה</th>
                <th className="py-2 sm:py-4 px-2 sm:px-6 text-right">תאריך התחלה</th>
                <th className="py-2 sm:py-4 px-2 sm:px-6 text-right">תאריך סיום</th>
              </tr>
            </thead>
            <tbody className="text-bg-text">
              {currentBooks.length > 0 ? currentBooks.map((book, index) => (
                <tr key={index} className="border-b border-bg-text hover:bg-bg-hover hover:text-bg-navbar-custom">
                  <td className="py-2 sm:py-4 px-2 sm:px-6 text-right">{book.title}</td>
                  <td className="py-2 sm:py-4 px-2 sm:px-6 text-right">{book.copyID}</td> 
                  <td className="py-2 sm:py-4 px-2 sm:px-6 text-right">{`${book.firstName} ${book.lastName}`}</td>
                  <td className="py-2 sm:py-4 px-2 sm:px-6 text-right">{book.familySize}</td>
                  <td className="py-2 sm:py-4 px-2 sm:px-6 text-right">{book.random}</td>
                  <td className="py-2 sm:py-4 px-2 sm:px-6 text-right">{book.email}</td>
                  <td className="py-2 sm:py-4 px-2 sm:px-6 text-right">{book.requestDate}</td>
                  <td className="py-2 sm:py-4 px-2 sm:px-6 text-right">{book.startDate}</td>
                  <td className="py-2 sm:py-4 px-2 sm:px-6 text-right">{book.endDate}</td>

                </tr>
              )) : <tr><td colSpan="8" className="text-center py-2 sm:py-4 text-bg-navbar-custom">לא נמצאו ספרים מושאלים</td></tr>}
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
        <div className="flex justify-center">
          <button
            onClick={exportToExcel}
            className="bg-bg-hover hover:bg-bg-hover text-bg-navbar-custom font-bold py-2 sm:py-3 px-4 sm:px-6 rounded"
          >
            ייצוא לאקסל
          </button>
        </div>
      </div>
    </>
  );
};

export default BorrowedCopiesReportPage;
