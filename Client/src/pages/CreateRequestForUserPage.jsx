import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';

const CreateRequestForUserPage = () => {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, booksResponse] = await Promise.all([
          axios.get('/api/users'),
          axios.get('/api/books/getAllBooksData')
        ]);

        if (usersResponse.data.success && Array.isArray(usersResponse.data.users)) {
          setUsers(usersResponse.data.users);
        } else {
          console.error("Unexpected data format:", usersResponse.data);
        }

        if (booksResponse.data.success && Array.isArray(booksResponse.data.books)) {
          setBooks(booksResponse.data.books);
        } else {
          console.error("Unexpected data format:", booksResponse.data);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRequest = async () => {
    if (!selectedUser || !selectedBook) {
      alert("אנא בחרו משתמש וספר.");
      return;
    }

    try {
      // Add user to the waiting list
      await axios.post(`/api/books/${selectedBook.id}/waiting-list`, { uid: selectedUser.uid });

      // Add entry to the user's borrowBooks-list
      await axios.post(`/api/users/${selectedUser.uid}/borrow-books-list`, { title: selectedBook.title });

      setSuccessMessage("הספר הוזמן בהצלחה");
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000); // Clear the success message after 3 seconds
    } catch (error) {
      console.error("Error handling request:", error.response ? error.response.data.message : error.message);
      alert(`${error.response ? error.response.data.message : "שגיאת שרת"}`);
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
          <FaSpinner className="animate-spin text-white text-6xl" />
        </div>
      )}
      <div className="container mx-auto px-4 py-8 max-w-7xl mt-10" dir="rtl">
        <h1 className="text-5xl font-extrabold text-center mb-8 tracking-wide">צור בקשה עבור משתמש</h1>
        <div className="bg-gray-600 border-4 border-gray-300 rounded-lg p-6 mb-4">
          <div className="flex justify-between mb-4">
            <div className="border-2 bg-gray-700 rounded-lg p-4 w-1/2 pr-2">
              <label className="block text-gray-50 text-lg font-medium mb-2">בחר משתמש:</label>
              <select
                className="w-full p-2 mb-4 text-lg bg-bg-navbar-custom shadow border rounded text-gray-50 leading-tight focus:outline-none focus:shadow-outline"
                value={selectedUser ? selectedUser.uid : ''}
                onChange={e => {
                  const user = users.find(u => u.uid === e.target.value);
                  setSelectedUser(user);
                }}
              >
                <option value="" disabled>בחר משתמש</option>
                {users.map(user => (
                  <option key={user.uid} value={user.uid}>
                    {user.email} - {user.displayName || 'אין שם תצוגה'}
                  </option>
                ))}
              </select>
            </div>
            <div className="border-2 bg-gray-700 rounded-lg p-4 w-1/2 pl-2">
              <label className="block text-gray-50 text-lg font-medium mb-2">בחר ספר:</label>
              <select
                className="w-full p-2 mb-4 text-lg bg-bg-navbar-custom shadow border rounded text-gray-50 leading-tight focus:outline-none focus:shadow-outline"
                value={selectedBook ? selectedBook.id : ''}
                onChange={e => {
                  const book = books.find(b => b.id === e.target.value);
                  setSelectedBook(book);
                }}
              >
                <option value="" disabled>בחר ספר</option>
                {books.map(book => (
                  <option key={book.id} value={book.id}>
                    {book.title} - {book.author}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <button
            onClick={handleRequest}
            className="bg-gray-700 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded"
          >
            צור בקשה
          </button>
        </div>
        {successMessage && (
          <div className="mt-4 px-6 py-3 bg-green-100 border border-green-500 text-green-800 text-lg font-bold rounded text-center">
            {successMessage}
          </div>
        )}
      </div>
    </>
  );
};

export default CreateRequestForUserPage;
