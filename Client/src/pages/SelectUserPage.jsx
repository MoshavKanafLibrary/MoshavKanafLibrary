import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';

const SelectUserPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [waitingList, setWaitingList] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [readBooks, setReadBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userList, setUserList] = useState([]);
  const [ratingLoading, setRatingLoading] = useState(true);
  const [hasRated, setHasRated] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        if (response.data.success) {
          setUserList(response.data.users);
        } else {
          console.error('Error fetching users:', response.data.message);
          setError('Error fetching users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Error fetching users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!selectedUser) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`/api/users/${selectedUser}`);
        if (response.data) {
          setUserDetails(response.data);
        } else {
          setError('User details not found');
        }

        const waitingListResponse = await axios.get('/api/waiting-list/details');
        if (waitingListResponse.data.success) {
          const userWaitingList = waitingListResponse.data.waitingListDetails.filter(entry => entry.uid === selectedUser);
          setWaitingList(userWaitingList);
        } else {
          console.error('Error fetching waiting list:', waitingListResponse.data.message);
        }

        const borrowedBooksResponse = await axios.get(`/api/users/${selectedUser}/present-borrow-books-list`);
        const borrowedBooksData = borrowedBooksResponse.data.borrowBooksList || {};
        const books = Object.entries(borrowedBooksData).map(([title, details]) => ({
          title,
          borrowedDate: details.startDate ? new Date(details.startDate.seconds * 1000).toLocaleDateString() : 'N/A',
          dueDate: details.endDate ? new Date(details.endDate.seconds * 1000).toLocaleDateString() : 'N/A',
          status: details.status,
          copyID: details.copyID,
        }));
        setBorrowedBooks(books);

        const historyBooksResponse = await axios.get(`/api/users/${selectedUser}/historyBooks`);
        const historyBooksData = historyBooksResponse.data.historyBooks || [];
        const readBooks = historyBooksData.map(book => ({
          title: book.title,
          readDate: book.readDate ? new Date(book.readDate.seconds * 1000).toLocaleDateString() : 'N/A',
        }));
        setReadBooks(readBooks);

        fetchRatings(readBooks);
      } catch (error) {
        console.error('Error fetching user details:', error);
        setError('Error fetching user details');
      } finally {
        setLoading(false);
      }
    };

    const fetchRatings = async (books) => {
      try {
        const ratingStatus = {};
        for (const book of books) {
          const bookResponse = await axios.get(`/api/books/names`);
          const bookDetails = bookResponse.data.bookNames.find(b => b.title === book.title);
          if (bookDetails) {
            const ratingResponse = await axios.get(`/api/books/${bookDetails.id}/rating-status`, { params: { uid: selectedUser } });
            ratingStatus[book.title] = ratingResponse.data.hasRated;
          }
        }
        setHasRated(ratingStatus);
      } catch (error) {
        console.error('Error fetching ratings:', error);
      } finally {
        setRatingLoading(false);
      }
    };

    if (selectedUser) {
      fetchUserDetails();
    }
  }, [selectedUser]);

  const handleUserChange = (event) => {
    setSelectedUser(event.target.value);
  };

  const getAlignmentClass = (length) => {
    if (length === 1) return 'justify-center'; 
    if (length === 2) return 'justify-between'; 
    return 'justify-start'; 
  };

  return (
    <div className="relative pt-16 sm:pt-20 z-10 h-screen overflow-x-hidden" dir="rtl">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-bg-navbar-custom text-center">פרטי משתמש</h1>
      
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-screen">
            <FaSpinner className="animate-spin text-4xl sm:text-6xl text-bg-navbar-custom" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <label htmlFor="userSelect" className="block text-base sm:text-lg font-bold mb-2 text-bg-navbar-custom">בחר משתמש</label>
              <select
                id="userSelect"
                value={selectedUser ?? ""}
                onChange={handleUserChange}
                className="p-2 border rounded-md bg-bg-navbar-custom text-bg-text text-sm sm:text-base"
              >
                <option value="">בחר משתמש</option>
                {userList.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} - {user.email}
                  </option>
                ))}
              </select>
            </div>

            {userDetails && (
              <>
                <div className="bg-bg-navbar-custom p-4 sm:p-6 rounded-lg shadow-lg text-center mb-8">
                  <h3 className="text-lg sm:text-xl font-extrabold text-bg-background-gradient-via mb-2 sm:mb-4">
                    שם מלא: {userDetails.firstName || 'N/A'} {userDetails.lastName || 'N/A'}
                  </h3>
                  <h3 className="text-lg sm:text-xl font-extrabold text-bg-background-gradient-via mb-2 sm:mb-4">
                    אימייל: {userDetails.email || 'N/A'}
                  </h3>
                  <h3 className="text-lg sm:text-xl font-extrabold text-bg-background-gradient-via mb-2 sm:mb-4">
                    פלאפון: {userDetails.phone || 'N/A'}
                  </h3>
                  <h3 className="text-lg sm:text-xl font-extrabold text-bg-background-gradient-via mb-2 sm:mb-4">
                    קוד משתמש: {userDetails.random || 'N/A'}
                  </h3>
                  <h3 className="text-lg sm:text-xl font-extrabold text-bg-background-gradient-via mb-2 sm:mb-4">
                    מנהל: {userDetails.isManager ? "כן" : "לא"}
                  </h3>
                </div>

                <div className="bg-bg-navbar-custom p-4 sm:p-6 rounded-lg shadow-lg text-center">
                  <h3 className="mt-4 sm:mt-6 text-lg sm:text-xl text-bg-text">ספרים בתהליכי השאלה</h3>
                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mt-2 sm:mt-4 ${getAlignmentClass(borrowedBooks.length)}`}>
                    {borrowedBooks.length > 0 ? (
                      borrowedBooks.map((book) => {
                        const isExpired = new Date(book.dueDate) < new Date();
                        const dateColor = book.status === 'pending'
                          ? 'bg-yellow-500'
                          : book.status === 'accepted'
                            ? 'bg-green-500'
                            : isExpired
                              ? 'bg-red-500'
                              : 'bg-gray-500';

                        return (
                          <div
                            key={book.copyID || book.title}
                            className="bg-bg-hover p-3 sm:p-4 rounded-lg shadow-lg flex flex-col items-center"
                          >
                            <h4 className="text-base sm:text-lg text-bg-navbar-custom">{book.title}</h4>
                            <p className={`text-sm sm:text-md ${dateColor} text-bg-navbar-custom py-1 sm:py-2 px-2 sm:px-4 rounded-full`}>
                              תאריך להחזרה: {book.dueDate}
                            </p>
                            <p className="text-bg-navbar-custom text-sm sm:text-base">סטטוס: {book.status === 'pending' ? 'ממתין' : 'מאושר'}</p>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-bg-text col-span-1 sm:col-span-2 text-center mt-2 sm:mt-4">לא השאלת ספרים עדיין.</p>
                    )}
                  </div>
                </div>

                <div className="bg-bg-navbar-custom p-4 sm:p-6 rounded-lg shadow-lg text-center mt-8">
                  <h3 className="mt-4 sm:mt-6 text-lg sm:text-xl text-bg-text">ספרים בהיסטוריה</h3>
                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mt-2 sm:mt-4 ${getAlignmentClass(readBooks.length)}`}>
                    {readBooks.length > 0 ? (
                      readBooks.map((book, index) => (
                        <div
                          key={`${book.title}-${index}`}
                          className="bg-bg-hover p-3 sm:p-4 rounded-lg shadow-lg flex flex-col items-center"
                        >
                          <h4 className="text-base sm:text-lg text-bg-navbar-custom">{book.title}</h4>
                          <p className="text-bg-navbar-custom text-sm sm:text-base">תאריך קריאה: {book.readDate}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-bg-text col-span-1 sm:col-span-2 text-center mt-2 sm:mt-4">לא קראת ספרים עדיין.</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SelectUserPage;
