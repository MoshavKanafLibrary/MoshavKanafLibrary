import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const AllBooksPage = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
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
      book.expenditure.toString().includes(lowerCaseQuery) ||
      book.copiesID.join(', ').toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredBooks(filtered);
    setCurrentPage(1); // Reset to first page on new search
  }, [searchQuery, books]);

  const indexOfLastBook = currentPage * itemsPerPage;
  const indexOfFirstBook = indexOfLastBook - itemsPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const exportToExcel = () => {
    const filteredBooksWithoutWaitingList = filteredBooks.map(({ waitingList, ...rest }) => rest);

    const worksheet = XLSX.utils.json_to_sheet(filteredBooksWithoutWaitingList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Books');
    XLSX.writeFile(workbook, 'books.xlsx');
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
          className={`px-4 py-2 mx-1 rounded-lg ${i === currentPage ? 'bg-[#8B0000] text-[#F5EFE6]' : 'bg-[#4B0000] text-[#F5EFE6]'}`}
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
          <FaSpinner className="animate-spin text-white text-6xl" />
        </div>
      )}
      <div className="container mx-auto px-4 py-8 max-w-7xl mt-10 " dir="rtl">
        <h1 className="text-5xl font-extrabold text-center mb-8 tracking-wide text-[#F5EFE6]">אוסף הספרים שלנו</h1>
        <input
          type="text"
          className="w-full p-2 mb-4 text-lg bg-[#F5EFE6] text-[#7C382A]"
          placeholder="חפש ספרים..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full bg-[#F5EFE6] rounded-lg shadow-lg">
            <thead className="bg-[#7C382A] text-[#F5EFE6] text-lg">
              <tr>
                <th className="py-4 px-6 text-right">כותר</th>
                <th className="py-4 px-6 text-right">מחבר</th>
                <th className="py-4 px-6 text-right">סיווג</th>
                <th className="py-4 px-6 text-right">עותקים</th>
                <th className="py-4 px-6 text-right">מספרי עותקים</th>
                <th className="py-4 px-6 text-right">עלות</th>
                <th className="py-4 px-6 text-right">קוד מיקום</th>
                <th className="py-4 px-6 text-right">סוג כותר</th>
              </tr>
            </thead>
            <tbody className="text-[#7C382A]">
              {currentBooks.length > 0 ? currentBooks.map((book, index) => (
                <tr key={index} className="border-b border-[#7C382A] hover:bg-[#8B0000] hover:text-[#F5EFE6] relative">
                  <td className="py-4 px-6 text-right">{book.title}</td>
                  <td className="py-4 px-6 text-right">{book.author}</td>
                  <td className="py-4 px-6 text-right">{book.classification}</td>
                  <td className="py-4 px-6 text-right">{book.copies}</td>
                  <td className="py-4 px-6 text-right">{book.copiesID.join(', ')}</td>
                  <td className="py-4 px-6 text-right">{book.expenditure}</td>
                  <td className="py-4 px-6 text-right">{book.locatorCode}</td>
                  <td className="py-4 px-6 text-right">{book.titleType}</td>
                </tr>
              )) : <tr><td colSpan="8" className="text-center py-4 text-[#F5EFE6]">לא נמצאו ספרים</td></tr>}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <button
              className="px-4 py-2 mx-2 rounded-lg bg-[#4B0000] text-[#F5EFE6]"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              {'<'}
            </button>
            {renderPageNumbers()}
            <button
              className="px-4 py-2 mx-2 rounded-lg bg-[#4B0000] text-[#F5EFE6]"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              {'>'}
            </button>
          </div>
        )}
        <div className="flex justify-center mt-4">
          <div className="flex items-center">
            <button
              onClick={exportToExcel}
              className="bg-[#4B0000] hover:bg-[#8B0000] text-[#F5EFE6] font-bold py-2 px-4 rounded"
            >
              ייצוא לאקסל
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AllBooksPage;
