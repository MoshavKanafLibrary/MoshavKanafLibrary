import React, { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const SelectUserPage = () => {
  const { uid } = useParams(); // Fetch uid from URL if it exists
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [readBooks, setReadBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [deleteEntry, setDeleteEntry] = useState(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Fetch user list on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        setUsers(response.data.users);
        setFilteredUsers(response.data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    fetchUsers();
  }, []);

  // Fetch specific user data by uid if it exists
  useEffect(() => {
    if (uid) {
      handleUserSelect(uid);
    }
  }, [uid]);

  // Filter users based on the search query
  useEffect(() => {
    const lowerCaseQuery = userSearchQuery.toLowerCase();
    const filtered = users.filter(user =>
      user.email.toLowerCase().includes(lowerCaseQuery) ||
      user.firstName.toLowerCase().includes(lowerCaseQuery) ||
      user.lastName.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredUsers(filtered);
  }, [userSearchQuery, users]);

  // Helper function to convert Firebase date format to a readable string
  const convertToDateString = (date) => {
    if (!date) return 'N/A';
    if (date.seconds) { 
      return new Date(date.seconds * 1000).toLocaleDateString();
    }
    return new Date(date).toLocaleDateString(); 
  };

  // Fetch user details, borrowed books, and read books based on uid
  const handleUserSelect = async (uid) => {
    setLoading(true);

    try {
      const userDetailsResponse = await axios.get(`/api/users/${uid}`);
      setUserDetails(userDetailsResponse.data);

      const historyResponse = await axios.get(`/api/users/${uid}/historyBooks`);
      const booksData = historyResponse.data.historyBooks || [];
      const books = booksData.map(book => ({
        title: book.title,
        returnDate: convertToDateString(book.returnDate),
        requestDate: convertToDateString(book.requestDate),
        startDate: convertToDateString(book.startDate),
      }));
      setReadBooks(books);

      const borrowedBooksResponse = await axios.get(`/api/users/${uid}/present-borrow-books-list`);
      const borrowedBooksData = borrowedBooksResponse.data.borrowBooksList || {};
      const borrowedBooks = Object.entries(borrowedBooksData).map(([title, details]) => ({
        title,
        borrowedDate: convertToDateString(details.borrowedDate),
        requestDate: convertToDateString(details.requestDate),
        startDate: convertToDateString(details.startDate),
        endDate: convertToDateString(details.endDate),
        status: details.status,
      }));
      setBorrowedBooks(borrowedBooks);

      // Set the selected user details for display
      setSelectedUser({
        firstName: userDetailsResponse.data.firstName,
        lastName: userDetailsResponse.data.lastName,
        email: userDetailsResponse.data.email,
        uid: uid,
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      setSelectedUser(null); // Reset if there's an error
    } finally {
      setLoading(false);
    }
  };

  // Handle book request cancellation
  const handleCancel = async (title) => {
    setDeleteEntry(title);
    setShowConfirmPopup(true);
  };

  // Confirm deletion of the request
  const confirmDelete = async () => {
    if (deleteEntry) {
      try {
        const bookResponse = await axios.get(`/api/books/names`);
        const book = bookResponse.data.bookNames.find(book => book.title === deleteEntry);

        if (book) {
          const deleteRequestResponse = await axios.delete(`/api/books/${book.id}/waiting-list`, { data: { uid: selectedUser.uid } });
          if (deleteRequestResponse.data.success) {
            console.log("Borrow request deleted successfully");

            const deleteBorrowListResponse = await axios.delete(`/api/users/${selectedUser.uid}/borrow-books-list/deletebookfromborrowlist`, { data: { title: deleteEntry } });
            if (deleteBorrowListResponse.data.success) {
              console.log("Book entry deleted from borrowBooks-list successfully");

              setBorrowedBooks(prevBooks => prevBooks.filter(book => book.title !== deleteEntry));
              await notifyManagers(deleteEntry);
            } else {
              console.error("Failed to delete book entry from borrowBooks-list");
            }
          } else {
            console.error("Failed to delete borrow request");
          }
        } else {
          console.error("Book not found");
        }
      } catch (error) {
        console.error(`Error canceling borrow request: ${error.response?.data?.message || error.message}`);
      } finally {
        setShowConfirmPopup(false);
        setDeleteEntry(null);
      }
    }
  };

  // Notify managers of cancellation
  const notifyManagers = async (bookTitle) => {
    try {
      const usersResponse = await axios.get('/api/users');
      const managers = usersResponse.data.users.filter(user => user.isManager);

      const notificationPromises = managers.map(manager =>
        axios.post(`/api/users/${manager.id}/notifications`, {
          message: `המנהל ${selectedUser.firstName} ${selectedUser.lastName} ביטל את בקשת ההשאלה לספר "${bookTitle}".`
        })
      );

      await Promise.all(notificationPromises);
      console.log("Managers notified successfully.");
    } catch (error) {
      console.error(`Error notifying managers: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="relative pt-20 z-10 h-screen overflow-x-hidden" dir="rtl">
      <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-bg-navbar-custom text-center">בחר משתמש</h1>
      <div className="container mx-auto px-4 py-8">
        <div className="relative w-full mb-4 flex justify-center">
          <div className="w-full sm:w-1/2 relative">
            <label className="block text-bg-navbar-custom text-lg font-medium mb-2">חפש משתמש:</label>
            <input
              type="text"
              className="w-full p-2 text-lg bg-bg-navbar-custom shadow border rounded text-bg-text leading-tight focus:outline-none focus:shadow-outline"
              placeholder="הכנס שם משתמש, אימייל או שם פרטי"
              value={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName} (${selectedUser.email})` : userSearchQuery}
              onChange={e => {
                setUserSearchQuery(e.target.value);
                setSelectedUser(null);
                setIsUserDropdownOpen(true);
              }}
              onFocus={() => setIsUserDropdownOpen(true)}
              onBlur={() => setTimeout(() => setIsUserDropdownOpen(false), 200)}
            />
            {isUserDropdownOpen && (
              <div
                className="absolute z-10 w-full bg-bg-navbar-custom border border-bg-background-gradient-from rounded-lg shadow-lg max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-track-rounded scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                style={{ direction: 'rtl', textAlign: 'right' }}
              >
                {filteredUsers.map(user => (
                  <div
                    key={user.uid}
                    onClick={() => {
                      handleUserSelect(user.uid);
                      setUserSearchQuery(`${user.firstName} ${user.lastName} (${user.email})`);
                      setIsUserDropdownOpen(false);
                    }}
                    className="cursor-pointer p-2 hover:bg-gray-300 text-right"
                  >
                    {user.email} - {`${user.firstName} ${user.lastName}`}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-screen">
            <FaSpinner className="animate-spin text-6xl text-bg-navbar-custom" />
          </div>
        ) : (
          <div>
            {userDetails && (
              <div className="bg-bg-navbar-custom p-6 rounded-lg shadow-lg text-center mb-8">
                <h3 className="text-2xl font-extrabold text-bg-background-gradient-via mb-4">
                  שם מלא: {userDetails.firstName} {userDetails.lastName}
                </h3>
                <h3 className="text-2xl font-extrabold text-bg-background-gradient-via mb-4">
                  אימייל: {userDetails.email}
                </h3>
                <h3 className="text-2xl font-extrabold text-bg-background-gradient-via mb-4">
                  כמות נפשות במשפחה: {userDetails.familySize}
                </h3>
                <h3 className="text-2xl font-extrabold text-bg-background-gradient-via mb-4">
                  פלאפון: {userDetails.phone}
                </h3>
                <h3 className="text-2xl font-extrabold text-bg-background-gradient-via mb-4">
                  קוד משתמש: {userDetails.random}
                </h3>
              </div>
            )}

            <div className="bg-bg-navbar-custom p-6 rounded-lg shadow-lg text-center">
              <h3 className="mt-6 text-2xl text-bg-text">ספרים מושאלים</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {borrowedBooks.length > 0 ? (
                  borrowedBooks.map((book, index) => {
                    const isExpired = new Date(book.requestDate) < new Date();
                    const titleColor = book.status === 'pending'
                      ? 'bg-yellow-500'
                      : book.status === 'accepted'
                        ? 'bg-green-500'
                        : isExpired
                          ? 'bg-red-500'
                          : 'bg-gray-500';

                    return (
                      <div
                        key={index}
                        className="bg-bg-hover p-4 rounded-lg shadow-lg flex flex-col items-center"
                      >
                        <h4 className={`text-xl text-bg-navbar-custom py-2 px-4 rounded-full ${titleColor}`}>
                          {book.title}
                        </h4>
                        <p className="text-md text-bg-navbar-custom mt-4">
                          תאריך בקשה: {book.requestDate}
                        </p>
                        <p className="text-bg-navbar-custom">סטטוס: {book.status === 'pending' ? 'ממתין' : 'מאושר'}</p>
                        {book.status === 'accepted' && (
                          <div className="mt-4">
                            <p className="text-bg-navbar-custom">תאריך התחלה: {book.startDate}</p>
                            <p className="text-bg-navbar-custom">תאריך סיום: {book.endDate}</p>
                          </div>
                        )}
                        {book.status === 'pending' && (
                          <button
                            className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => handleCancel(book.title)}
                          >
                            בטל
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-bg-text col-span-1 sm:col-span-2 text-center mt-4">לא השאלת ספרים עדיין.</p>
                )}
              </div>
            </div>

            <div className="bg-bg-navbar-custom p-6 rounded-lg shadow-lg text-center mt-8">
              <h3 className="mt-6 text-2xl text-bg-text">מה כבר קראתי?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {readBooks.length > 0 ? (
                  readBooks.map((book, index) => (
                    <div
                      key={index}
                      className="bg-bg-hover p-4 rounded-lg shadow-lg flex flex-col items-center"
                    >
                      <h4 className="text-xl text-bg-navbar-custom">{book.title}</h4>
                      <p className="text-bg-navbar-custom">תאריך בקשה: {book.requestDate}</p>
                      <p className="text-bg-navbar-custom">תאריך התחלה: {book.startDate}</p>
                      <p className="text-bg-navbar-custom">תאריך החזרה בפועל: {book.returnDate}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-bg-text col-span-1 sm:col-span-2 text-center mt-4">לא קראת ספרים עדיין.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {showConfirmPopup && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4">אשר מחיקה</h2>
              <p>האם אתה בטוח שברצונך למחוק בקשת השאלה זו?</p>
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setShowConfirmPopup(false)}
                  className="mr-4 px-4 py-2 bg-gray-300 rounded"
                >
                  בטל
                </button>
                <button 
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  אשר
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectUserPage;
