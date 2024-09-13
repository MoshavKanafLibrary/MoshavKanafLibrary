import React, { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import useUser from '../hooks/useUser';

const ProfilePage = () => {
  const { user } = useUser();
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [readBooks, setReadBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [deleteEntry, setDeleteEntry] = useState(null);
  const [ratings, setRatings] = useState({});
  const [hasRated, setHasRated] = useState({});
  const [ratingLoading, setRatingLoading] = useState(true);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user) {
        console.error("No user is currently logged in.");
        return;
      }

      try {
        const response = await axios.get(`/api/users/${user.uid}`);
        setUserDetails(response.data);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    const fetchUserHistoryBooks = async () => {
      if (!user) {
        console.error("No user is currently logged in.");
        return;
      }
    
      try {
        const response = await axios.get(`/api/users/${user.uid}/historyBooks`);
        const booksData = response.data.historyBooks || [];
        const books = booksData.map(book => ({
          title: book.title,
          returnDate: new Date(book.returnDate.seconds * 1000).toLocaleDateString(),
          requestDate: book.requestDate ? new Date(book.requestDate.seconds * 1000).toLocaleDateString() : 'N/A',
          startDate: book.startDate ? new Date(book.startDate.seconds * 1000).toLocaleDateString() : 'N/A',
        }));
        setReadBooks(books);
    
        // Fetch ratings in parallel after basic details are set
        fetchRatings(books);
      } catch (error) {
        console.error('Error fetching history books:', error);
      }
    };
    
    const fetchRatings = async (books) => {
      try {
        const ratingStatus = {};
        for (const book of books) {
          const bookResponse = await axios.get(`/api/books/names`);
          const bookDetails = bookResponse.data.bookNames.find(b => b.title === book.title);
          if (bookDetails) {
            const ratingResponse = await axios.get(`/api/books/${bookDetails.id}/rating-status`, { params: { uid: user.uid } });
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

    const convertToDateString = (date) => {
      if (!date) return 'N/A';
      if (date.seconds) { 
        return new Date(date.seconds * 1000).toLocaleDateString();
      }
      return new Date(date).toLocaleDateString(); 
    };

    const fetchBorrowedBooks = async () => {
      if (!user) {
        console.error("No user is currently logged in.");
        return;
      }

      try {
        const response = await axios.get(`/api/users/${user.uid}/present-borrow-books-list`);
        const borrowedBooksData = response.data.borrowBooksList || {};
        console.log(borrowedBooksData);
        const books = Object.entries(borrowedBooksData).map(([title, details]) => ({
          title,
          borrowedDate: convertToDateString(details.borrowedDate),
          requestDate: convertToDateString(details.requestDate),
          startDate: convertToDateString(details.startDate),
          endDate: convertToDateString(details.endDate),
          status: details.status,
        }));
        setBorrowedBooks(books);
      } catch (error) {
        console.error('Error fetching borrowed books:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserDetails();
      fetchUserHistoryBooks();
      fetchBorrowedBooks();
    }
  }, [user]);

  const handleCancel = async (title) => {
    setDeleteEntry(title);
    setShowConfirmPopup(true);
  };

  const confirmDelete = async () => {
    if (deleteEntry) {
      try {
        const bookResponse = await axios.get(`/api/books/names`);
        const book = bookResponse.data.bookNames.find(book => book.title === deleteEntry);

        if (book) {
          const deleteRequestResponse = await axios.delete(`/api/books/${book.id}/waiting-list`, { data: { uid: user.uid } });
          if (deleteRequestResponse.data.success) {
            console.log("Borrow request deleted successfully");

            const deleteBorrowListResponse = await axios.delete(`/api/users/${user.uid}/borrow-books-list/deletebookfromborrowlist`, { data: { title: deleteEntry } });
            if (deleteBorrowListResponse.data.success) {
              console.log("Book entry deleted from borrowBooks-list successfully");

              setBorrowedBooks(prevBooks => prevBooks.filter(book => book.title !== deleteEntry));

              // Notify managers
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

  const notifyManagers = async (bookTitle) => {
    try {
      // Fetch all users to find managers
      const usersResponse = await axios.get('/api/users');
      const managers = usersResponse.data.users.filter(user => user.isManager);

      // Send notification to each manager
      const notificationPromises = managers.map(manager =>
        axios.post(`/api/users/${manager.id}/notifications`, {
          message: `User ${user.displayName} has canceled the borrow request for the book titled "${bookTitle}".`
        })
      );

      await Promise.all(notificationPromises);
      console.log("Managers notified successfully.");
    } catch (error) {
      console.error(`Error notifying managers: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleRatingChange = (title, rating) => {
    setRatings({ ...ratings, [title]: rating });
  };

  const submitRating = async (title) => {
    const rating = ratings[title];
    if (!rating || rating < 1 || rating > 5) {
      alert("Please provide a valid rating between 1 and 5.");
      return;
    }

    try {
      const bookResponse = await axios.get(`/api/books/names`);
      const book = bookResponse.data.bookNames.find(book => book.title === title);
      
      if (book) {
        const response = await axios.post(`/api/books/${book.id}/rate`, { rating, uid: user.uid });
        if (response.data.success) {
          console.log(`Rating for ${title} submitted successfully`);
          setHasRated({ ...hasRated, [title]: true });
        } else {
          console.error("Failed to submit rating");
        }
      } else {
        console.error("Book not found for rating");
      }
    } catch (error) {
      console.error(`Error submitting rating: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="relative pt-20 z-10 h-screen overflow-x-hidden">
      <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-bg-navbar-custom text-center">פרופיל</h1>
  
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-screen">
            <FaSpinner className="animate-spin text-6xl text-bg-navbar-custom" />
          </div>
        ) : (
          <div>
            {userDetails && (
              <div className="bg-bg-navbar-custom p-6 rounded-lg shadow-lg text-center mb-8 ">
                <h3 className="text-2xl font-extrabold text-bg-background-gradient-via mb-4"> שם מלא: {userDetails.firstName} {userDetails.lastName}</h3>
                <h3 className="text-2xl font-extrabold text-bg-background-gradient-via mb-4"> {userDetails.email} :אימייל</h3>
                <h3 className="text-2xl font-extrabold text-bg-background-gradient-via mb-4"> {userDetails.familySize} :כמות נפשות במשפחה</h3>
                <h3 className="text-2xl font-extrabold text-bg-background-gradient-via mb-4"> {userDetails.phone} :פלאפון</h3>
                <h3 className="text-2xl font-extrabold text-bg-background-gradient-via mb-4"> {userDetails.random} :קוד משתמש</h3>
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

                    {ratingLoading ? (
                      <FaSpinner className="animate-spin text-2xl text-bg-navbar-custom mt-4" />
                    ) : (
                      !hasRated[book.title] ? (
                        <div className="mt-4">
                          <label className="text-bg-navbar-custom">דרג את הספר:</label>
                          <select
                            className="ml-2 bg-gray-200 p-1 rounded"
                            value={ratings[book.title] || ""}
                            onChange={(e) => handleRatingChange(book.title, parseInt(e.target.value))}
                          >
                            <option value="">בחר דירוג</option>
                            {[1, 2, 3, 4, 5].map(value => (
                              <option key={value} value={value}>{value}</option>
                            ))}
                          </select>
                          <button
                            className="ml-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-4 rounded"
                            onClick={() => submitRating(book.title)}
                          >
                            שלח
                          </button>
                        </div>
                      ) : (
                        <p className="text-green-500 mt-4">דרגת את הספר הזה</p>
                      )
                    )}
                  </div>
                ))
              ) : (
                <p className="text-bg-text col-span-1 sm:col-span-2 text-center mt-4">לא קראת ספרים עדיין.</p>
              )}
            </div>
          </div>

          </div>
        )}
      </div>
  
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
  );
};

export default ProfilePage;
