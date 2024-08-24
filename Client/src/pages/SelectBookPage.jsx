import React, { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import axios from 'axios';

const SelectBookPage = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [copies, setCopies] = useState([]);
  const [borrowedCopies, setBorrowedCopies] = useState([]);
  const [availableCopies, setAvailableCopies] = useState([]);
  const [waitingList, setWaitingList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('/api/books/getAllBooksData');
        setBooks(response.data.books);
        setFilteredBooks(response.data.books);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };
    
    fetchBooks();
  }, []);

  useEffect(() => {
    const lowerCaseQuery = bookSearchQuery.toLowerCase();
    const filtered = books.filter(book =>
      book.title.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredBooks(filtered);
  }, [bookSearchQuery, books]);

  const convertToDateString = (date) => {
    if (!date) return 'N/A';
    if (date.seconds) { 
      return new Date(date.seconds * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric"
      });
    }
    const convertedDate = new Date(date);
    return isNaN(convertedDate) ? 'N/A' : convertedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    });
  };

  const handleBookSelect = async (id) => {
    setLoading(true);

    try {
      const bookDetailsResponse = await axios.get(`/api/books/${id}`);
      setSelectedBook(bookDetailsResponse.data.bookData);
      
      const copiesResponse = await axios.get(`/api/book/getCopiesByTitle`, { params: { title: bookDetailsResponse.data.bookData.title } });
      const allCopies = copiesResponse.data.copies;
      setCopies(allCopies);

      const borrowed = allCopies.filter(copy => copy.borrowedTo);
      setBorrowedCopies(borrowed.map(copy => ({
        ...copy,
        borrowedTo: {
          ...copy.borrowedTo,
          startDate: convertToDateString(copy.borrowedTo.startDate),
          endDate: convertToDateString(copy.borrowedTo.endDate),
        },
      })));

      const available = allCopies.filter(copy => !copy.borrowedTo);
      setAvailableCopies(available);

      const waitingListResponse = await axios.get('/api/waiting-list/details');
      const waiting = waitingListResponse.data.waitingListDetails.filter(entry => entry.bookTitle === bookDetailsResponse.data.bookData.title);
      setWaitingList(waiting);
    } catch (error) {
      console.error('Error fetching book data:', error);
      setSelectedBook(null); // Reset if there's an error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative pt-20 z-10 h-screen overflow-x-hidden" dir="rtl">
      <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-bg-navbar-custom text-center">בחר ספר</h1>
      <div className="container mx-auto px-4 py-8">
        <div className="relative w-full mb-4 flex justify-center">
          <div className="w-full sm:w-1/2 relative">
            <label className="block text-bg-navbar-custom text-lg font-medium mb-2">חפש ספר:</label>
            <input
              type="text"
              className="w-full p-2 text-lg bg-bg-navbar-custom shadow border rounded text-bg-text leading-tight focus:outline-none focus:shadow-outline"
              placeholder="הכנס שם ספר"
              value={selectedBook ? selectedBook.title : bookSearchQuery}
              onChange={e => {
                setBookSearchQuery(e.target.value);
                setSelectedBook(null);
                setIsBookDropdownOpen(true);
              }}
              onFocus={() => setIsBookDropdownOpen(true)}
              onBlur={() => setTimeout(() => setIsBookDropdownOpen(false), 200)}
            />
            {isBookDropdownOpen && (
              <div
                className="absolute z-10 w-full bg-bg-navbar-custom border border-bg-background-gradient-from rounded-lg shadow-lg max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-track-rounded scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                style={{ direction: 'rtl', textAlign: 'right' }}
              >
                {filteredBooks.map(book => (
                  <div
                    key={book.id}
                    onClick={() => {
                      handleBookSelect(book.id);
                      setBookSearchQuery(book.title);
                      setIsBookDropdownOpen(false);
                    }}
                    className="cursor-pointer p-2 hover:bg-gray-300 text-right"
                  >
                    {book.title}
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
            {selectedBook && (
              <div className="bg-bg-navbar-custom p-6 rounded-lg shadow-lg text-center mb-8">
                <h3 className="text-2xl font-extrabold text-bg-background-gradient-via mb-4">
                  כותרת הספר: {selectedBook.title}
                </h3>
                <h3 className="text-2xl font-extrabold text-bg-background-gradient-via mb-4">
                  מחבר: {selectedBook.author}
                </h3>
                <h3 className="text-2xl font-extrabold text-bg-background-gradient-via mb-4">
                  עותקים: {copies.length}
                </h3>
              </div>
            )}

            <div className="bg-bg-navbar-custom p-6 rounded-lg shadow-lg text-center">
              <h3 className="mt-6 text-2xl text-bg-text">עותקים זמינים</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {availableCopies.length > 0 ? (
                  availableCopies.map((copy, index) => (
                    <div
                      key={index}
                      className="bg-bg-hover p-4 rounded-lg shadow-lg flex flex-col items-center"
                    >
                      <h4 className="text-xl text-bg-navbar-custom">עותק {copy.copyID}</h4>
                      <p className="text-bg-navbar-custom">סטטוס: זמין</p>
                    </div>
                  ))
                ) : (
                  <p className="text-bg-text col-span-1 sm:col-span-2 text-center mt-4">אין עותקים זמינים כרגע.</p>
                )}
              </div>
            </div>

            <div className="bg-bg-navbar-custom p-6 rounded-lg shadow-lg text-center mt-8">
              <h3 className="mt-6 text-2xl text-bg-text">עותקים מושאלים</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {borrowedCopies.length > 0 ? (
                  borrowedCopies.map((copy, index) => (
                    <div
                      key={index}
                      className="bg-bg-hover p-4 rounded-lg shadow-lg flex flex-col items-center"
                    >
                      <h4 className="text-xl text-bg-navbar-custom">עותק {copy.copyID}</h4>
                      <p className="text-bg-navbar-custom">מושאל ל: {copy.borrowedTo.firstName} {copy.borrowedTo.lastName}</p>
                      <p className="text-bg-navbar-custom">תאריך התחלה: {copy.borrowedTo.startDate}</p>
                      <p className="text-bg-navbar-custom">תאריך סיום: {copy.borrowedTo.endDate}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-bg-text col-span-1 sm:col-span-2 text-center mt-4">לא מושאלים כרגע.</p>
                )}
              </div>
            </div>

            <div className="bg-bg-navbar-custom p-6 rounded-lg shadow-lg text-center mt-8">
              <h3 className="mt-6 text-2xl text-bg-text">רשימת המתנה</h3>
              <ul className="list-decimal list-inside mx-auto mt-4 text-bg-header-custom space-y-4 text-center">
                {waitingList.length > 0 ? (
                  waitingList.map((entry, index) => (
                    <li
                      key={index}
                      className="bg-bg-hover p-4 rounded-lg shadow-lg"
                    >
                      <h4 className="text-xl text-bg-navbar-custom">{entry.firstName} {entry.lastName}</h4>
                      <p className="text-bg-navbar-custom">תאריך בקשה: {convertToDateString(entry.waitingDate)}</p>
                      <p className="text-bg-navbar-custom">אימייל: {entry.email}</p>
                    </li>
                  ))
                ) : (
                  <p className="text-bg-text text-center mt-4">אין כרגע רשימת המתנה.</p>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectBookPage;
