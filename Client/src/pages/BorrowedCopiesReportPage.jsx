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
      copy.title.toLowerCase().includes(lowerCaseQuery) ||
      copy.copyID.toLowerCase().includes(lowerCaseQuery) ||
      copy.borrowedTo.some(borrower =>
        borrower.displayName.toLowerCase().includes(lowerCaseQuery) ||
        borrower.uid.toLowerCase().includes(lowerCaseQuery)
      )
    );
    setFilteredCopies(filtered);
  }, [searchQuery, borrowedCopies]);

  const indexOfLastCopy = currentPage * itemsPerPage;
  const indexOfFirstCopy = indexOfLastCopy - itemsPerPage;
  const currentCopies = filteredCopies.slice(indexOfFirstCopy, indexOfLastCopy);
  const totalPages = Math.ceil(filteredCopies.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const exportToExcel = () => {
    // Prepare the data for export
    const dataForExport = filteredCopies.map(copy => {
      // Flatten the borrowedTo array for each copy
      return {
        כותר: copy.title,
        מזהה_עותק: copy.copyID,
        שם_משאיל: copy.borrowedTo.map(borrower => borrower.displayName).join(', '),
        מזהה_משאיל: copy.borrowedTo.map(borrower => borrower.uid).join(', ')
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
      <div className="container mx-auto px-4 py-8 max-w-7xl mt-10" dir="rtl">
        <h1 className="text-5xl font-extrabold text-center mb-8 tracking-wide">דוח עותקים מושאלים</h1>
        <input
          type="text"
          className="w-full p-2 mb-4 text-lg"
          placeholder="חפש עותקים מושאלים..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full bg-white rounded-lg shadow-lg">
            <thead className="bg-gray-800 text-white text-lg">
              <tr>
                <th className="py-4 px-6 text-right">כותר</th>
                <th className="py-4 px-6 text-right">מזהה עותק</th>
                <th className="py-4 px-6 text-right">שם משאיל</th>
                <th className="py-4 px-6 text-right">מזהה משאיל</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentCopies.length > 0 ? currentCopies.map((copy, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-4 px-6 text-right">{copy.title}</td>
                  <td className="py-4 px-6 text-right">{copy.copyID}</td>
                  <td className="py-4 px-6 text-right">
                    {copy.borrowedTo.map((borrower, i) => (
                      <div key={i} className="mb-2">
                        {borrower.displayName}
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
                </tr>
              )) : <tr><td colSpan="4" className="text-center py-4">לא נמצאו עותקים מושאלים</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center mb-4">
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
        <div className="flex justify-center">
          <button
            onClick={exportToExcel}
            className="bg-gray-700 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded"
          >
            ייצוא לאקסל
          </button>
        </div>
      </div>
    </>
  );
};

export default BorrowedCopiesReportPage;
