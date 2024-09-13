import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';


const CreateRequestForUserPage = () => {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [borrowSuccessMessage, setBorrowSuccessMessage] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState(false);
  const [copies, setCopies] = useState([]); 
  const [isLoadingCopies, setIsLoadingCopies] = useState(false); 
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { uid } = useParams();


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
        }

        if (booksResponse.data.success && Array.isArray(booksResponse.data.books)) {
          setBooks(booksResponse.data.books);
          setFilteredBooks(usersResponse.data.books);
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
    console.log("handleRequest called");
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
        navigate(`/SelectUser/${selectedUser.uid}`);
     }, 2000);
     
    } catch (error) {
      console.error("Error handling request:", error.response ? error.response.data.message : error.message);
      alert(`${error.response ? error.response.data.message : "שגיאת שרת"}`);
    }
  };
  

  const fetchCopiesForBook = async (bookTitle) => {
    try {
      setIsLoadingCopies(true);
      const response = await axios.get("/api/book/getCopiesByTitle", { params: { title: bookTitle } });
      if (response.status === 200 && response.data.copies) {
        setCopies(response.data.copies);
      } else {
        setError("לא נמצאו עותקים עבור כותר זה.");
      }
    } catch (error) {
      setError(`נכשל בשליפת עותקים: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoadingCopies(false);
    }
  };

  const handleBorrow = async (copyID) => {
    if (!selectedUser) {
      alert("אנא בחר משתמש.");
      return;
    }
  
    try {
      const updateBorrowResponse = await axios.put('/api/copies/updateBorrowedTo', {
        copyID,
        uid: selectedUser.uid,
        title: selectedBook.title
      });
  
      if (updateBorrowResponse.data.success) {
        const acceptBorrowResponse = await axios.post(`/api/users/${selectedUser.uid}/accept-borrow-books-list`, {
          title: selectedBook.title
        });
  
        if (acceptBorrowResponse.data.success) {
          setBorrowSuccessMessage("הספר הושאל בהצלחה.");
          setTimeout(() => {
            setBorrowSuccessMessage('');
            navigate(`/SelectUser/${selectedUser.uid}`);
         }, 2000);         
        } else {
          setError("נכשל בעדכון borrow-books-list.");
        }
      } else {
        setError("נכשל בעדכון השדה borrowedTo.");
      }
    } catch (error) {
      console.error("Error handling borrow:", error);
      alert("שגיאה בתהליך ההשאלה.");
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
        <h1 className="text-3xl md:text-5xl font-extrabold text-center mb-8 tracking-wide text-bg-navbar-custom">
          צור בקשת השאלה / השאל למשתמש
        </h1>
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
                        fetchCopiesForBook(book.title);
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

        {isLoadingCopies ? (
          <div className="flex justify-center items-center">
            <FaSpinner className="animate-spin text-6xl text-bg-navbar-custom" />
          </div>
        ) : (
          <>
            {copies.length > 0 ? (
              <div className="w-full px-4 flex flex-wrap justify-center gap-4">
                {copies.map((copy, index) => (
                  <div key={index} className="bg-bg-navbar-custom p-4 rounded-lg shadow mb-4 w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
                    <div><strong>כותר:</strong> {copy.title}</div>
                    <div><strong>מספר עותק:</strong> {copy.copyID}</div>
                    <div><strong>סטטוס:</strong> {copy.borrowedTo ? `הושאל ל-${copy.borrowedTo.firstName} ${copy.borrowedTo.lastName}` : "זמין"}</div>
                    {!copy.borrowedTo && (
                      <button
                        className="mt-4 bg-bg-hover hover:bg-bg-hover text-bg-navbar-custom font-bold py-2 px-4 rounded"
                        onClick={() => handleBorrow(copy.copyID)}
                      >
                        השאל ל-{`${selectedUser?.firstName || ''} ${selectedUser?.lastName || ''}`}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-bg-navbar-custom">חפש ספר ומשתמש על מנת לראות את העותקים הזמינים</div>
            )}
          </>
        )}

        {borrowSuccessMessage && (
          <div className="mt-4 px-6 py-3 bg-green-100 border border-green-500 text-green-800 text-lg font-bold rounded text-center">
            {borrowSuccessMessage}
          </div>
        )}
        {error && <div className="text-red-500 p-3 rounded bg-gray-100 my-2 text-center">{error}</div>}

        <div className="flex justify-center mt-4">
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
