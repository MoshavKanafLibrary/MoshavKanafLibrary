import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaSpinner, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const WaitingListPage = () => {
  const [loading, setLoading] = useState(true);
  const [waitingListDetails, setWaitingListDetails] = useState([]);
  const [filteredWaitingList, setFilteredWaitingList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [hoverIndex, setHoverIndex] = useState(-1);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [deleteEntry, setDeleteEntry] = useState(null);
  const navigate = useNavigate();

  const fetchWaitingListDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/waiting-list/details');
      if (response.data.success) {
        setWaitingListDetails(response.data.waitingListDetails);
        setFilteredWaitingList(response.data.waitingListDetails);
      } else {
        console.error('Error fetching waiting list details:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching waiting list details:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWaitingListDetails();
  }, [fetchWaitingListDetails]);

  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = waitingListDetails.filter(entry =>
      (entry.firstName?.toLowerCase() || '').includes(lowerCaseQuery) ||
      (entry.lastName?.toLowerCase() || '').includes(lowerCaseQuery) ||
      (entry.email?.toLowerCase() || '').includes(lowerCaseQuery) ||
      (entry.bookTitle?.toLowerCase() || '').includes(lowerCaseQuery) ||
      (entry.waitingDate?.toLowerCase() || '').includes(lowerCaseQuery)
    );
    setFilteredWaitingList(filtered);
    setCurrentPage(1);
  }, [searchQuery, waitingListDetails]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredWaitingList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredWaitingList.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleRowClick = (entry) => {
    navigate('/BookBorrowDetails', { state: { ...entry } });
  };

  const handleDeleteClick = (entry) => {
    setDeleteEntry(entry);
    setShowConfirmPopup(true);
  };

  const confirmDelete = async () => {
    if (deleteEntry) {
      try {
        console.log("Deleting entry:", deleteEntry);
        const responseBook = await axios.delete(`/api/books/${deleteEntry.bookId}/waiting-list`, { data: { uid: deleteEntry.uid } });
        const responseUser = await axios.delete(`/api/users/${deleteEntry.uid}/borrow-books-list/deletebookfromborrowlist`, { data: { title: deleteEntry.bookTitle } });

        if (responseBook.status === 200 && responseUser.status === 200) {
          console.log("Both delete requests were successful");
          const updatedWaitingList = waitingListDetails.filter(entry => !(entry.uid === deleteEntry.uid && entry.bookId === deleteEntry.bookId));
          const updatedFilteredWaitingList = filteredWaitingList.filter(entry => !(entry.uid === deleteEntry.uid && entry.bookId === deleteEntry.bookId));

          setWaitingListDetails(updatedWaitingList);
          setFilteredWaitingList(updatedFilteredWaitingList);
        } else {
          console.error("Error in one of the delete requests:", responseBook, responseUser);
        }
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
          <FaSpinner className="animate-spin text-white text-6xl" />
        </div>
      )}
      <div className="container mx-auto px-4 py-8 max-w-7xl mt-10 " dir="rtl">
        <h1 className="text-3xl md:text-5xl font-extrabold text-center mb-8 tracking-wide text-bg-navbar-custom">בקשות השאלה</h1>
        <input
          type="text"
          placeholder="חפש לפי שם, אימייל, תאריך או כותר הספר..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-10 p-2 w-full border rounded-md bg-bg-navbar-custom text-bg-text"
        />
        <div className="flex flex-col space-y-2">
          <div className="hidden sm:grid sm:grid-cols-6 text-center font-bold bg-bg-text p-4 rounded-lg text-bg-navbar-custom">
            <div>Uid</div>
            <div>שם פרטי</div>
            <div>שם משפחה</div>
            <div>אימייל</div>
            <div>תאריך בקשה</div>
            <div>כותר הספר</div>
          </div>
          {currentItems.length > 0 ? (
            currentItems.map((entry, index) => (
              <div key={index}
                className={`grid grid-cols-1 sm:grid-cols-6 text-center bg-bg-navbar-custom hover:bg-bg-hover hover:text-bg-navbar-custom p-4 rounded-lg shadow cursor-pointer relative`}
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
                  className="absolute top-2 right-2 text-red-500 cursor-pointer hover:text-red-700"
                  onClick={(e) => { e.stopPropagation(); handleDeleteClick(entry); }}
                />
              </div>
            ))
          ) : (
            <div className="text-center text-bg-navbar-custom">לא נמצאו תוצאות</div>
          )}
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
        {showConfirmPopup && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-4">אישור מחיקה</h2>
              <p>האם אתה בטוח שברצונך למחוק את הבקשה של {deleteEntry?.firstName} {deleteEntry?.lastName}?</p>
              <div className="mt-4 flex justify-between">
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                  onClick={confirmDelete}
                >
                  אישור
                </button>
                <button
                  className="px-4 py-2 bg-gray-300 text-black rounded-lg"
                  onClick={() => setShowConfirmPopup(false)}
                >
                  ביטול
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default WaitingListPage;
