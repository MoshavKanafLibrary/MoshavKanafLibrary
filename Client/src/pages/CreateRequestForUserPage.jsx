import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';

const CreateRequestForUserPage = () => {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, booksResponse] = await Promise.all([
          axios.get('/api/users'),
          axios.get('/api/books/getAllBooksData')
        ]);

        if (usersResponse.data.success && Array.isArray(usersResponse.data.users)) {
          setUsers(usersResponse.data.users);
          setFilteredUsers(usersResponse.data.users);
        } else {
          console.error("Unexpected data format:", usersResponse.data);
        }

        if (booksResponse.data.success && Array.isArray(booksResponse.data.books)) {
          setBooks(booksResponse.data.books);
          setFilteredBooks(booksResponse.data.books);
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

  useEffect(() => {
    const lowerCaseQuery = userSearchQuery.toLowerCase();
    const filtered = users.filter(user =>
      user.email.toLowerCase().includes(lowerCaseQuery) ||
      user.firstName.toLowerCase().includes(lowerCaseQuery) ||
      user.lastName.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredUsers(filtered);
  }, [userSearchQuery, users]);

  useEffect(() => {
    const lowerCaseQuery = bookSearchQuery.toLowerCase();
    const filtered = books.filter(book =>
      book.title.toLowerCase().includes(lowerCaseQuery) ||
      book.author.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredBooks(filtered);
  }, [bookSearchQuery, books]);

  const handleRequest = async () => {
    if (!selectedUser || !selectedBook) {
      alert("אנא בחרו משתמש וספר.");
      return;
    }

    try {
      await axios.post(`/api/books/${selectedBook.id}/waiting-list`, { uid: selectedUser.uid });
      await axios.post(`/api/users/${selectedUser.uid}/borrow-books-list`, { title: selectedBook.title });

      setSuccessMessage("הספר הוזמן בהצלחה");
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
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
        <h1 className="text-3xl md:text-5xl font-extrabold text-center mb-8 tracking-wide text-bg-navbar-custom">צור בקשה עבור משתמש</h1>
        <div className="bg-bg-hover border-4 border-bg-background-gradient-from rounded-lg p-6 mb-4">
          <div className="flex flex-col space-y-4">
            <div className="relative w-full">
              <label className="block text-bg-navbar-custom text-lg font-medium mb-2">חפש משתמש:</label>
              <input
                type="text"
                className="w-full p-2 mb-4 text-lg bg-bg-navbar-custom shadow border rounded text-bg-text leading-tight focus:outline-none focus:shadow-outline"
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
                <div className="absolute z-10 w-full bg-bg-navbar-custom border border-bg-background-gradient-from rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredUsers.map(user => (
                    <div
                      key={user.uid}
                      onClick={() => {
                        setSelectedUser(user);
                        setUserSearchQuery(`${user.firstName} ${user.lastName} (${user.email})`);
                        setIsUserDropdownOpen(false);
                      }}
                      className="cursor-pointer p-2 hover:bg-gray-300"
                    >
                      {user.email} - {`${user.firstName} ${user.lastName}`}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative w-full">
              <label className="block text-bg-navbar-custom text-lg font-medium mb-2">חפש ספר:</label>
              <input
                type="text"
                className="w-full p-2 mb-4 text-lg bg-bg-navbar-custom shadow border rounded text-bg-text leading-tight focus:outline-none focus:shadow-outline"
                placeholder="הכנס שם ספר או סופר"
                value={selectedBook ? `${selectedBook.title} - ${selectedBook.author}` : bookSearchQuery}
                onChange={e => {
                  setBookSearchQuery(e.target.value);
                  setSelectedBook(null);
                  setIsBookDropdownOpen(true);
                }}
                onFocus={() => setIsBookDropdownOpen(true)}
                onBlur={() => setTimeout(() => setIsBookDropdownOpen(false), 200)}
              />
              {isBookDropdownOpen && (
                <div className="absolute z-10 w-full bg-bg-navbar-custom border border-bg-background-gradient-from rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredBooks.map(book => (
                    <div
                      key={book.id}
                      onClick={() => {
                        setSelectedBook(book);
                        setBookSearchQuery(`${book.title} - ${book.author}`);
                        setIsBookDropdownOpen(false);
                      }}
                      className="cursor-pointer p-2 hover:bg-gray-300"
                    >
                      {book.title} - {book.author}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <button
            onClick={handleRequest}
            className="bg-bg-hover hover:bg-bg-hover text-bg-navbar-custom font-bold py-2 px-4 rounded"
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
