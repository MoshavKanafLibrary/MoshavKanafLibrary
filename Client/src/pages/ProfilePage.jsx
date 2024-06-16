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

  useEffect(() => {
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
          readDate: new Date(book.readDate.seconds * 1000).toLocaleDateString()
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

    const fetchBorrowedBooks = async () => {
      if (!user) {
        console.error("No user is currently logged in.");
        return;
      }

      try {
        const response = await axios.get(`/api/users/${user.uid}/present-borrow-books-list`);
        const borrowedBooksData = response.data.borrowBooksList || {};
        const books = Object.entries(borrowedBooksData).map(([title, details]) => ({
          title,
          borrowedDate: details.startDate ? new Date(details.startDate.seconds * 1000).toLocaleDateString() : 'N/A',
          dueDate: details.endDate ? new Date(details.endDate.seconds * 1000).toLocaleDateString() : 'N/A',
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
          alert(`Thank you for rating ${title}. Average rating is now ${response.data.averageRating}`);
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
    <div className="relative pt-20 z-10 h-screen bg-gradient-to-br from-gray-300 via-gray-200 to-gray-100 overflow-x-hidden">
      <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-black text-center">Profile</h1>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-screen">
            <FaSpinner className="animate-spin text-6xl text-gray-800" />
          </div>
        ) : (
          <div>
            <div className="bg-gray-700 p-6 rounded-lg shadow-lg text-center">
              <h3 className="mt-6 text-2xl text-white">Borrowed Books</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {borrowedBooks.length > 0 ? (
                  borrowedBooks.map((book, index) => {
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
                        key={index}
                        className="bg-gray-600 p-4 rounded-lg shadow-lg flex flex-col items-center"
                      >
                        <h4 className="text-xl text-white">{book.title}</h4>
                        <p className={`text-md ${dateColor} text-white py-2 px-4 rounded-full`}>
                          Due Date: {book.dueDate}
                        </p>
                        <p className="text-gray-300">Status: {book.status === 'pending' ? 'Pending' : 'Accepted'}</p>
                        {book.status === 'pending' && (
                          <button
                            className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => handleCancel(book.title)}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-white col-span-1 sm:col-span-2 text-center mt-4">You haven't borrowed any books yet.</p>
                )}
              </div>
            </div>

            <div className="bg-gray-700 p-6 rounded-lg shadow-lg text-center mt-8">
              <h3 className="mt-6 text-2xl text-white">What Have I Already Read?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {readBooks.length > 0 ? (
                  readBooks.map((book, index) => (
                    <div
                      key={index}
                      className="bg-gray-600 p-4 rounded-lg shadow-lg flex flex-col items-center"
                    >
                      <h4 className="text-xl text-white">{book.title}</h4>
                      <p className="text-gray-300">Read Date: {book.readDate}</p>

                      {/* Loading Indicator for Ratings */}
                      {ratingLoading ? (
                        <FaSpinner className="animate-spin text-2xl text-gray-300 mt-4" />
                      ) : (
                        !hasRated[book.title] ? (
                          <div className="mt-4">
                            <label className="text-white">Rate this book:</label>
                            <select
                              className="ml-2 bg-gray-200 p-1 rounded"
                              value={ratings[book.title] || ""}
                              onChange={(e) => handleRatingChange(book.title, parseInt(e.target.value))}
                            >
                              <option value="">Select a rating</option>
                              {[1, 2, 3, 4, 5].map(value => (
                                <option key={value} value={value}>{value}</option>
                              ))}
                            </select>
                            <button
                              className="ml-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-4 rounded"
                              onClick={() => submitRating(book.title)}
                            >
                              Submit
                            </button>
                          </div>
                        ) : (
                          <p className="text-green-500 mt-4">You have rated this book</p>
                        )
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-white col-span-1 sm:col-span-2 text-center mt-4">You haven't read any books yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Popup */}
      {showConfirmPopup && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this borrow request?</p>
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
    </div>
  );
};

export default ProfilePage;
