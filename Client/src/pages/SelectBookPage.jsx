import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';

const SelectBookPage = () => {
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookDetails, setBookDetails] = useState(null);
  const [availableCopies, setAvailableCopies] = useState([]);
  const [borrowedCopies, setBorrowedCopies] = useState([]);
  const [waitingList, setWaitingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookList, setBookList] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('/api/books/names');
        if (response.data.success) {
          setBookList(response.data.bookNames);
        } else {
          console.error('Error fetching books:', response.data.message);
          setError('Error fetching books');
        }
      } catch (error) {
        console.error('Error fetching books:', error);
        setError('Error fetching books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!selectedBook) return;

      setLoading(true);
      setError(null);

      try {
        const bookResponse = await axios.get(`/api/books/${selectedBook}`);
        if (bookResponse.data.success) {
          setBookDetails(bookResponse.data.bookData);
        } else {
          setError('Book details not found');
        }

        const availableCopiesResponse = await axios.get(`/api/book/getCopiesByTitle`, {
          params: { title: bookResponse.data.bookData.title }
        });
        if (availableCopiesResponse.data.success) {
          setAvailableCopies(availableCopiesResponse.data.copies);
        } else {
          console.error('Error fetching available copies:', availableCopiesResponse.data.message);
        }

        const borrowedCopiesResponse = await axios.get(`/api/copies/borrowed`);
        if (borrowedCopiesResponse.data.success) {
          const bookBorrowedCopies = borrowedCopiesResponse.data.borrowedCopies.filter(copy => copy.title === bookResponse.data.bookData.title);
          setBorrowedCopies(bookBorrowedCopies);
        } else {
          console.error('Error fetching borrowed copies:', borrowedCopiesResponse.data.message);
        }

        const waitingListResponse = await axios.get('/api/waiting-list/details');
        if (waitingListResponse.data.success) {
          const bookWaitingList = waitingListResponse.data.waitingListDetails
            .filter(entry => entry.bookId === selectedBook)
            .sort((a, b) => new Date(a.waitingDate) - new Date(b.waitingDate));
          setWaitingList(bookWaitingList);
        } else {
          console.error('Error fetching waiting list:', waitingListResponse.data.message);
        }

      } catch (error) {
        console.error('Error fetching book details:', error);
        setError('Error fetching book details');
      } finally {
        setLoading(false);
      }
    };

    if (selectedBook) {
      fetchBookDetails();
    }
  }, [selectedBook]);

  const handleBookChange = (event) => {
    setSelectedBook(event.target.value);
  };

  const getAlignmentClass = (length) => {
    if (length === 1) return 'justify-center'; 
    if (length === 2) return 'justify-between'; 
    return 'justify-start'; 
  };

  return (
    <div className="relative pt-20 z-10 h-screen overflow-x-hidden" dir="rtl">
      <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-bg-navbar-custom text-center">פרטי ספר</h1>
      
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-screen">
            <FaSpinner className="animate-spin text-6xl text-bg-navbar-custom" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <label htmlFor="bookSelect" className="block text-lg font-bold mb-2 text-bg-navbar-custom">בחר ספר</label>
              <select
                id="bookSelect"
                value={selectedBook ?? ""}
                onChange={handleBookChange}
                className="p-2 border rounded-md bg-bg-navbar-custom text-bg-text"
              >
                <option value="">בחר ספר</option>
                {bookList.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title} - {book.author}
                  </option>
                ))}
              </select>
            </div>

            {bookDetails && (
              <>
                <div className="bg-bg-navbar-custom p-6 rounded-lg shadow-lg text-center mb-8">
                  <h3 className="text-2xl font-extrabold text-bg-background-gradient-via mb-4">
                    כותרת: {bookDetails.title}
                  </h3>
                  <h3 className="text-2xl font-extrabold text-bg-background-gradient-via mb-4">
                    סופר: {bookDetails.author}
                  </h3>
                  <h3 className="text-2xl font-extrabold text-bg-background-gradient-via mb-4">
                    מספר עותקים: {bookDetails.copies}
                  </h3>
                  <h3 className="text-2xl font-extrabold text-bg-background-gradient-via mb-4">
                    דירוג ממוצע: {bookDetails.averageRating?.toFixed(2) || 'לא דורג עדיין'}
                  </h3>
                </div>

                <div className="bg-bg-navbar-custom p-6 rounded-lg shadow-lg text-center">
                  <h3 className="mt-6 text-2xl text-bg-text">עותקים זמינים</h3>
                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 ${getAlignmentClass(availableCopies.length)}`}>
                    {availableCopies.length > 0 ? (
                      availableCopies.map((copy) => (
                        <div
                          key={copy.copyID}
                          className="bg-bg-hover p-4 rounded-lg shadow-lg flex flex-col items-center"
                        >
                          <h4 className="text-xl text-bg-navbar-custom">מספר עותק: {copy.copyID}</h4>
                          <p className="text-bg-navbar-custom">ID עותק: {copy.copyID}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-bg-text col-span-1 sm:col-span-2 text-center mt-4">אין עותקים זמינים כרגע.</p>
                    )}
                  </div>
                </div>

                <div className="bg-bg-navbar-custom p-6 rounded-lg shadow-lg text-center mt-8">
                  <h3 className="mt-6 text-2xl text-bg-text">עותקים מושאלים</h3>
                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 ${getAlignmentClass(borrowedCopies.length)}`}>
                    {borrowedCopies.length > 0 ? (
                      borrowedCopies.map((copy) => (
                        <div
                          key={copy.copyID}
                          className="bg-bg-hover p-4 rounded-lg shadow-lg flex flex-col items-center"
                        >
                          <h4 className="text-xl text-bg-navbar-custom">מספר עותק: {copy.copyID}</h4>
                          <p className="text-bg-navbar-custom">הושאל ל: {copy.borrowedTo.firstName} {copy.borrowedTo.lastName}</p>
                          <p className="text-bg-navbar-custom">תאריך השאלה: {new Date(copy.borrowedTo.startDate).toLocaleDateString()}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-bg-text col-span-1 sm:col-span-2 text-center mt-4">אין עותקים מושאלים כרגע.</p>
                    )}
                  </div>
                </div>

                <div className="bg-bg-navbar-custom p-6 rounded-lg shadow-lg text-center mt-8">
                  <h3 className="mt-6 text-2xl text-bg-text">רשימת המתנה</h3>
                  <ul className="list-disc pr-5 mt-4 text-center">
                    {waitingList.length > 0 ? (
                      waitingList.map((entry, index) => (
                        <li key={`${entry.uid}-${index}`} className="bg-bg-hover p-4 rounded-lg shadow-lg mb-2">
                          <h4 className="text-xl text-bg-navbar-custom">{entry.firstName} {entry.lastName}</h4>
                          <p className="text-bg-navbar-custom">תאריך בקשה: {new Date(entry.waitingDate).toLocaleDateString()}</p>
                        </li>
                      ))
                    ) : (
                      <p className="text-bg-text col-span-1 sm:col-span-2 text-center mt-4">אין רשימת המתנה לספר זה.</p>
                    )}
                  </ul>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SelectBookPage;
