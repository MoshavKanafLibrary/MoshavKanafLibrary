import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';
import * as XLSX from 'xlsx';

const BorrowedCopiesReportPage = () => {
  const [borrowedCopies, setBorrowedCopies] = useState([]);
  const [filteredCopies, setFilteredCopies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    axios.get("/api/copies/borrowed")
      .then(response => {
        if (response.data.success && Array.isArray(response.data.borrowedCopies)) {
          setBorrowedCopies(response.data.borrowedCopies);
          setFilteredCopies(response.data.borrowedCopies);
        } else {
          console.error("Unexpected data format:", response.data);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching borrowed copies:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = borrowedCopies.filter(copy =>
      (copy.title && copy.title.toLowerCase().includes(lowerCaseQuery)) ||
      (copy.copyID && copy.copyID.toString().toLowerCase().includes(lowerCaseQuery)) ||
      copy.borrowedTo.some(borrower =>
        (borrower.firstName && borrower.firstName.toLowerCase().includes(lowerCaseQuery)) ||
        (borrower.lastName && borrower.lastName.toLowerCase().includes(lowerCaseQuery)) ||
        (borrower.uid && borrower.uid.toLowerCase().includes(lowerCaseQuery)) ||
        (borrower.phone && borrower.phone.toLowerCase().includes(lowerCaseQuery))
      )
    );
    setFilteredCopies(filtered);
    setCurrentPage(1); // Reset to first page on new search
  }, [searchQuery, borrowedCopies]);

  const indexOfLastCopy = currentPage * itemsPerPage;
  const indexOfFirstCopy = indexOfLastCopy - itemsPerPage;
  const currentCopies = filteredCopies.slice(indexOfFirstCopy, indexOfLastCopy);
  const totalPages = Math.ceil(filteredCopies.length / itemsPerPage);

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
          className={`px-4 py-2 mx-1 rounded-lg ${i === currentPage ? 'bg-[#8B0000] text-[#E7DBCB]' : 'bg-[#4B0000] text-[#E7DBCB]'}`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  const exportToExcel = () => {
    // Prepare the data for export
    const dataForExport = filteredCopies.map(copy => {
      // Flatten the borrowedTo array for each copy
      return {
        כותר: copy.title,
        מזהה_עותק: copy.copyID,
        שם_פרטי: copy.borrowedTo.map(borrower => borrower.firstName).join(', '),
        שם_משפחה: copy.borrowedTo.map(borrower => borrower.lastName).join(', '),
        מזהה_משאיל: copy.borrowedTo.map(borrower => borrower.uid).join(', '),
        טלפון: copy.borrowedTo.map(borrower => borrower.phone).join(', ')
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Borrowed Copies');
    XLSX.writeFile(workbook, 'borrowed_copies_report.xlsx');
  };

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
          <FaSpinner className="animate-spin text-white text-6xl" />
        </div>
      )}
      <div className="container mx-auto px-4 py-8 max-w-7xl mt-10 b" dir="rtl">
        <h1 className="text-5xl font-extrabold text-center mb-8 tracking-wide text-[#E7DBCB]">דוח עותקים מושאלים</h1>
        <input
          type="text"
          className="w-full p-2 mb-4 text-lg bg-[#E7DBCB] text-[#7C382A]"
          placeholder="חפש עותקים מושאלים..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full bg-[#E7DBCB] rounded-lg shadow-lg">
            <thead className="bg-[#7C382A] text-[#E7DBCB] text-lg">
              <tr>
                <th className="py-4 px-6 text-right">כותר</th>
                <th className="py-4 px-6 text-right">מזהה עותק</th>
                <th className="py-4 px-6 text-right">שם פרטי</th>
                <th className="py-4 px-6 text-right">שם משפחה</th>
                <th className="py-4 px-6 text-right">מזהה משאיל</th>
                <th className="py-4 px-6 text-right">טלפון</th>
              </tr>
            </thead>
            <tbody className="text-[#7C382A]">
              {currentCopies.length > 0 ? currentCopies.map((copy, index) => (
                <tr key={index} className="border-b border-[#7C382A] hover:bg-[#8B0000] hover:text-[#E7DBCB]">
                  <td className="py-4 px-6 text-right">{copy.title}</td>
                  <td className="py-4 px-6 text-right">{copy.copyID}</td>
                  <td className="py-4 px-6 text-right">
                    {copy.borrowedTo.map((borrower, i) => (
                      <div key={i} className="mb-2">
                        {borrower.firstName}
                      </div>
                    ))}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {copy.borrowedTo.map((borrower, i) => (
                      <div key={i} className="mb-2">
                        {borrower.lastName}
                      </div>
                    ))}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {copy.borrowedTo.map((borrower, i) => (
                      <div key={i} className="mb-2">
                        {borrower.uid}
                      </div>
                    ))}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {copy.borrowedTo.map((borrower, i) => (
                      <div key={i} className="mb-2">
                        {borrower.phone}
                      </div>
                    ))}
                  </td>
                </tr>
              )) : <tr><td colSpan="6" className="text-center py-4 text-[#E7DBCB]">לא נמצאו עותקים מושאלים</td></tr>}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <button
              className="px-4 py-2 mx-2 rounded-lg bg-[#4B0000] text-[#E7DBCB]"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              {'<'}
            </button>
            {renderPageNumbers()}
            <button
              className="px-4 py-2 mx-2 rounded-lg bg-[#4B0000] text-[#E7DBCB]"
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
            className="bg-[#4B0000] hover:bg-[#8B0000] text-[#E7DBCB] font-bold py-2 px-4 rounded"
          >
            ייצוא לאקסל
          </button>
        </div>
      </div>
    </>
  );
};

export default BorrowedCopiesReportPage;
