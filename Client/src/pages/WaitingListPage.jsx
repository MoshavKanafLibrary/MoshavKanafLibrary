import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWaitingListData = async () => {
      setLoading(true);
      try {
        const { data: booksData } = await axios.get("/api/books/getAllBooksData");
        const waitingListUsersPromises = booksData.books
          .filter(book => book.waitingList && book.waitingList.length > 0)
          .map(book => book.waitingList.map(async waitingEntry => {
            const { data: userData } = await axios.get(`/api/users/${waitingEntry.uid}`);
            return {
              ...userData,
              bookTitle: book.title,
              waitingDate: waitingEntry.Time ? format(new Date(waitingEntry.Time.seconds * 1000), "MMM dd, yyyy p") : 'Date unknown',
              uid: waitingEntry.uid // Assuming each entry has a unique identifier
            };
          })).flat();

        const waitingListUsers = await Promise.all(waitingListUsersPromises);
        setWaitingList(waitingListUsers);
        setFilteredWaitingList(waitingListUsers);
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
      entry.displayName.toLowerCase().includes(lowerCaseQuery) ||
      entry.bookTitle.toLowerCase().includes(lowerCaseQuery) ||
      entry.waitingDate.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredWaitingList(filtered);
  }, [searchQuery, waitingList]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredWaitingList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredWaitingList.length / itemsPerPage);

  const paginate = pageNumber => setCurrentPage(pageNumber);

  const handleRowClick = (entry) => {
    navigate('/BookBorrowDetails', { state: { bookTitle: entry.bookTitle, displayName: entry.displayName, uid: entry.uid } });
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
          placeholder="Search by name, date, or book title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-10 p-2 w-full"
        />
        <div className="flex flex-col space-y-2">
          {/* Header Row */}
          <div className="grid grid-cols-4 text-center font-bold bg-gray-600 p-4 rounded-lg text-white">
            <div>Uid</div>
            <div>Name</div>
            <div>Request Date</div>
            <div>Book Title</div>
          </div>
          {/* Entries */}
          {currentItems.map((entry, index) => (
            <div key={index}
              className={`grid grid-cols-4 text-center bg-white hover:bg-gray-200 p-4 rounded-lg shadow cursor-pointer ${hoverIndex === index ? 'translate-x-10 text-blue-800' : ''}`}
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
              <div>{entry.waitingDate}</div>
              <div>{entry.bookTitle}</div>
            </div>
          ))}
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
        <div className="flex justify-center mt-4">
          <button
            onClick={() => navigate("/manager")}
            className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded"
          >
            Go Back to ManagerPage
          </button>
        </div>
      </div>
    </>
  );
};

export default WaitingListPage;
