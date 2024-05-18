import React, { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa'; // Import FaSpinner from react-icons/fa
import axios from 'axios';
import useUser from '../hooks/useUser';

const ProfilePage = () => {
  const { user } = useUser();
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [readBooks, setReadBooks] = useState([]);
  const [loading, setLoading] = useState(true); // State for loading status

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
      } catch (error) {
        console.error('Error fetching history books:', error);
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
        setLoading(false); // Set loading to false when both data fetching operations are complete
      }
    };

    if (user) {
      fetchUserHistoryBooks();
      fetchBorrowedBooks();
    }
  }, [user]);

  const handleCancel = async (title) => {
    if (!window.confirm("Are you sure you want to cancel the borrow request?")) {
      return;
    }

    try {
      // Get book ID using book title
      const bookResponse = await axios.get(`/api/books/names`);
      const book = bookResponse.data.bookNames.find(book => book.title === title);

      if (book) {
        // Remove the user from the waiting list by book ID
        const deleteRequestResponse = await axios.delete(`/api/books/${book.id}/waiting-list`, { data: { uid: user.uid } });
        if (deleteRequestResponse.data.success) {
          console.log("Borrow request deleted successfully");

          // Delete the book entry from the borrowBooks-list
          const deleteBorrowListResponse = await axios.delete(`/api/users/${user.uid}/borrow-books-list/deletebookfromborrowlist`, { data: { title } });
          if (deleteBorrowListResponse.data.success) {
            console.log("Book entry deleted from borrowBooks-list successfully");

            // Update the state to remove the canceled book
            setBorrowedBooks(prevBooks => prevBooks.filter(book => book.title !== title));
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
    }
  };

  return (
    <div className="relative pt-20 z-10 h-screen bg-gradient-to-br from-gray-300 via-gray-200 to-gray-100 overflow-x-hidden">
      <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-black text-center">Profile</h1>

      <div className="container mx-auto px-4 py-8">
        {loading ? ( // Conditional rendering based on loading state
          <div className="flex justify-center items-center h-screen">
            <FaSpinner className="animate-spin text-6xl text-gray-800" /> {/* Adjust size */}
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
    </div>
  );
};

export default ProfilePage;
