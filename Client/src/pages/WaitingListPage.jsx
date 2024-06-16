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
      (entry.displayName?.toLowerCase() || '').includes(lowerCaseQuery) ||
      (entry.email?.toLowerCase() || '').includes(lowerCaseQuery) ||
      (entry.bookTitle?.toLowerCase() || '').includes(lowerCaseQuery) ||
      (entry.waitingDate?.toLowerCase() || '').includes(lowerCaseQuery)
    );
    setFilteredWaitingList(filtered);
  }, [searchQuery, waitingList]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredWaitingList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredWaitingList.length / itemsPerPage);

  const paginate = pageNumber => setCurrentPage(pageNumber);

  const handleRowClick = (entry) => {
    navigate('/BookBorrowDetails', { state: { bookTitle: entry.bookTitle, displayName: entry.displayName, uid: entry.uid, email: entry.email } });
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

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
          <FaSpinner className="animate-spin text-white text-6xl" />
        </div>
      )}
      <div className="container mx-auto px-4 py-8 max-w-7xl mt-10">
        <h1 className="text-5xl font-extrabold text-center mb-8 tracking-wide">Borrow Requests</h1>
        <input
          type="text"
          placeholder="Search by name, email, date, or book title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-10 p-2 w-full"
        />
        <div className="flex flex-col space-y-2">
          {/* Header Row */}
          <div className="grid grid-cols-5 text-center font-bold bg-gray-600 p-4 rounded-lg text-white">
            <div>Uid</div>
            <div>Name</div>
            <div>Email</div>
            <div>Request Date</div>
            <div>Book Title</div>
          </div>
          {/* Entries */}
          {currentItems.length > 0 ? (
            currentItems.map((entry, index) => (
              <div key={index}
                className={`grid grid-cols-5 text-center bg-white hover:bg-gray-200 p-4 rounded-lg shadow cursor-pointer relative ${hoverIndex === index ? 'translate-x-10 text-blue-800' : ''}`}
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(-1)}
                onClick={() => handleRowClick(entry)}
                style={{
                  transform: hoverIndex === index ? 'translateX(10px)' : 'none',
                  transition: 'transform 0.2s'
                }}
              >
                <div>{entry.uid}</div>
                <div>{entry.displayName}</div>
                <div>{entry.email}</div>
                <div>{entry.waitingDate}</div>
                <div>{entry.bookTitle}</div>
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
            <div className="text-center py-4">No requests found</div>
          )}
        </div>
        <div className="flex justify-center mt-4">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => paginate(index + 1)}
              className={`mx-1 px-4 py-2 rounded ${currentPage === index + 1 ? 'bg-gray-700 hover:bg-gray-800 text-white' : 'bg-gray-300 text-black'}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Confirmation Popup */}
      {showConfirmPopup && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this request?</p>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowConfirmPopup(false)}
                className="mr-4 px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WaitingListPage;
