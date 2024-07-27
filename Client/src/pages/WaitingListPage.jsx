import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSpinner, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const WaitingListPage = () => {
  const [loading, setLoading] = useState(true);
  const [waitingList, setWaitingList] = useState([]);
  const [filteredWaitingList, setFilteredWaitingList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [hoverIndex, setHoverIndex] = useState(-1);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [deleteEntry, setDeleteEntry] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWaitingListData = async () => {
      setLoading(true);
      try {
        const { data: booksData } = await axios.get("/api/books/getAllBooksData");
        if (booksData.success) {
          const waitingListUsersPromises = booksData.books
            .filter(book => book.waitingList && book.waitingList.length > 0)
            .flatMap(book => book.waitingList.map(async waitingEntry => {
              try {
                const { data: userData } = await axios.get(`/api/users/${waitingEntry.uid}`);
                return {
                  ...userData,
                  bookTitle: book.title,
                  waitingDate: waitingEntry.Time ? format(new Date(waitingEntry.Time.seconds * 1000), "MMM dd, yyyy p") : 'Date unknown',
                  uid: waitingEntry.uid,
                  email: userData.email,
                  firstName: userData.firstName, // Adding firstName
                  lastName: userData.lastName, // Adding lastName
                  bookId: book.id
                };
              } catch (userError) {
                console.error(`Error fetching user data for UID ${waitingEntry.uid}:`, userError);
                return null; // Skip this entry if user data fetch fails
              }
            }));

          const waitingListUsers = (await Promise.all(waitingListUsersPromises)).filter(Boolean); // Filter out null values
          setWaitingList(waitingListUsers);
          setFilteredWaitingList(waitingListUsers);
        } else {
          console.error("Error fetching books data:", booksData);
        }
      } catch (error) {
        console.error("Error fetching waiting list data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWaitingListData();
  }, []);

  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = waitingList.filter(entry =>
      (entry.firstName?.toLowerCase() || '').includes(lowerCaseQuery) ||
      (entry.lastName?.toLowerCase() || '').includes(lowerCaseQuery) ||
      (entry.email?.toLowerCase() || '').includes(lowerCaseQuery) ||
      (entry.bookTitle?.toLowerCase() || '').includes(lowerCaseQuery) ||
      (entry.waitingDate?.toLowerCase() || '').includes(lowerCaseQuery)
    );
    setFilteredWaitingList(filtered);
    setCurrentPage(1); // Reset to first page on new search
  }, [searchQuery, waitingList]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredWaitingList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredWaitingList.length / itemsPerPage);

  const paginate = pageNumber => setCurrentPage(pageNumber);

  const handleRowClick = (entry) => {
    navigate('/BookBorrowDetails', { state: { bookTitle: entry.bookTitle, firstName: entry.firstName, lastName: entry.lastName, phone: entry.phone, uid: entry.uid, email: entry.email } });
  };

  const handleDeleteClick = (entry) => {
    setDeleteEntry(entry);
    setShowConfirmPopup(true);
  };

  const confirmDelete = async () => {
    if (deleteEntry) {
      try {
        await axios.delete(`/api/books/${deleteEntry.bookId}/waiting-list`, { data: { uid: deleteEntry.uid } });
        await axios.delete(`/api/users/${deleteEntry.uid}/borrow-books-list/deletebookfromborrowlist`, { data: { title: deleteEntry.bookTitle } });
        setWaitingList(prevList => prevList.filter(entry => entry.uid !== deleteEntry.uid));
        setFilteredWaitingList(prevList => prevList.filter(entry => entry.uid !== deleteEntry.uid));
      } catch (error) {
        console.error("Error deleting request:", error);
      } finally {
        setShowConfirmPopup(false);
        setDeleteEntry(null);
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
          className={`px-4 py-2 mx-1 rounded-lg ${i === currentPage ? 'bg-[#8B0000] text-[#E7DBCB]' : 'bg-[#4B0000] text-[#E7DBCB]'}`}
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
        <h1 className="text-3xl md:text-5xl font-extrabold text-center mb-8 tracking-wide text-[#E7DBCB]">בקשות השאלה</h1>
        <input
          type="text"
          placeholder="חפש לפי שם, אימייל, תאריך או כותר הספר..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-10 p-2 w-full border rounded-md bg-[#E7DBCB] text-[#7C382A]"
        />
        <div className="flex flex-col space-y-2">
          {/* Header Row */}
          <div className="hidden sm:grid sm:grid-cols-6 text-center font-bold bg-[#7C382A] p-4 rounded-lg text-[#E7DBCB]">
            <div>Uid</div>
            <div>שם פרטי</div>
            <div>שם משפחה</div>
            <div>אימייל</div>
            <div>תאריך בקשה</div>
            <div>כותר הספר</div>
          </div>
          {/* Entries */}
          {currentItems.length > 0 ? (
            currentItems.map((entry, index) => (
              <div key={index}
                className={`grid grid-cols-1 sm:grid-cols-6 text-center bg-[#E7DBCB] hover:bg-[#8B0000] hover:text-[#E7DBCB] p-4 rounded-lg shadow cursor-pointer relative`}
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(-1)}
                onClick={() => handleRowClick(entry)}
                style={{
                  transform: hoverIndex === index ? 'translateX(10px)' : 'none',
                  transition: 'transform 0.2s'
                }}
              >
                <div className="sm:block">{entry.uid}</div>
                <div className="sm:block">{entry.firstName}</div>
                <div className="sm:block">{entry.lastName}</div>
                <div className="sm:block">{entry.email}</div>
                <div className="sm:block">{entry.waitingDate}</div>
                <div className="sm:block">{entry.bookTitle}</div>
                <FaTimes
                  className="absolute top-0 right-0 m-2 text-red-600 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(entry);
                  }}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-[#E7DBCB]">לא נמצאו בקשות</div>
          )}
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
      </div>

      {/* Confirmation Popup */}
      {showConfirmPopup && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-[#E7DBCB] p-4 sm:p-8 rounded-lg shadow-lg max-w-sm w-full mx-2">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-[#7C382A]">אישור מחיקה</h2>
            <p className="text-[#7C382A]">האם אתה בטוח שברצונך למחוק את הבקשה?</p>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowConfirmPopup(false)}
                className="mr-2 px-4 py-2 bg-gray-300 rounded text-[#7C382A]"
              >
                ביטול
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-[#E7DBCB] rounded"
              >
                אישור
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WaitingListPage;
