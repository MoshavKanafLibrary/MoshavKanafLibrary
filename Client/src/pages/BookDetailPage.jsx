import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';
import useUser from '../hooks/useUser';

const BookDetailPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { book } = state;

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const { user } = useUser();

  useEffect(() => {
    if (!book) {
      navigate('/'); // Redirect to homepage if book data is not available
      return;
    }

    // Fetch books with matching titles
    axios.get('/api/books/getBooksMatchingTitles', {
      params: { bookName: book.title }
    })
      .then(response => {
        setBooks(response.data);
        setLoading(false);
        console.log("Books loaded from the server:", response.data);
      })
      .catch(error => {
        setLoading(false);
        console.error("Error fetching books:", error.message);
      });

    // Fetch reviews for the book
    axios.get(`/api/books/${book.id}/reviews`)
      .then(response => {
        const reviewsWithParsedDates = response.data.reviews.map(review => ({
          ...review,
          reviewedAt: new Date(review.reviewedAt.seconds * 1000) // Convert Firestore Timestamp to JS Date
        }));
        setReviews(reviewsWithParsedDates);
      })
      .catch(error => {
        console.error("Error fetching reviews:", error.message);
      });
  }, [book, navigate]);

  const handleOrderNow = async () => {
    if (!user) {
      alert("עליך להיכנס למערכת");
    } else {
      try {
        await axios.post(`/api/books/${book.id}/waiting-list`, { uid: user.uid });
        await axios.post(`/api/users/${user.uid}/borrow-books-list`, { title: book.title });
        setSuccessMessage("הזמנתך הוגשה בהצלחה.\nנעדכן אותך ברגע שהספר שלך יהיה מוכן לאיסוף!");
        setTimeout(() => {
          setSuccessMessage('');
        }, 6000); // Clear the success message after 6 seconds
      } catch (error) {
        console.error("Error handling order:", error.response ? error.response.data.message : error.message);
        alert(`${error.response ? error.response.data.message : "שגיאת שרת"}`);
      }
    }
  };

  const handleReviewSubmit = async () => {
    if (!user) {
      alert("עליך להיכנס למערכת כדי לשלוח ביקורת.");
      return;
    }
    if (!reviewText.trim()) {
      alert("טקסט הביקורת לא יכול להיות ריק.");
      return;
    }

    try {
      await axios.post(`/api/books/${book.id}/reviews`, {
        uid: user.uid,
        displayName: user.displayName,
        review: reviewText.trim(),
        reviewedAt: new Date() // Use JavaScript Date for the new review
      });
      setSuccessMessage("הביקורת נשלחה בהצלחה!");
      setReviews([...reviews, {
        uid: user.uid,
        displayName: user.displayName,
        review: reviewText.trim(),
        reviewedAt: new Date() // Add new review with current date
      }]);
      setReviewText('');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000); // Clear the success message after 3 seconds
    } catch (error) {
      console.error("Error submitting review:", error.response ? error.response.data.message : error.message);
      alert(`${error.response ? error.response.data.message : "שגיאת שרת"}`);
    }
  };

  return (
    <div className="container mx-auto px-2 md:px-4 py-8 mt-10 flex flex-col lg:flex-row lg:space-x-8 space-y-8 lg:space-y-0" dir="rtl">
      {/* Reviews Section */}
      <div className="lg:w-1/4 bg-gray-400 shadow-md rounded-lg p-4 max-h-[450px] overflow-y-auto order-2 lg:order-1">
        <h2 className="text-xl font-bold mb-4 text-center lg:text-right">ביקורות משתמשים</h2>
        <div className="mb-4">
          {user ? (
            <div className="flex flex-col space-y-4">
              <textarea
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                placeholder="כתוב את הביקורת שלך..."
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
              />
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none"
                onClick={handleReviewSubmit}
              >
                שלח ביקורת
              </button>
            </div>
          ) : (
            <p className="text-center text-gray-700">עליך להיכנס למערכת כדי לשלוח ביקורת.</p>
          )}
        </div>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg shadow-md">
                <p className="font-semibold">{review.displayName}</p>
                <p className="text-gray-600">{review.review}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(review.reviewedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-700">אין עדיין ביקורות. היה הראשון לכתוב ביקורת!</p>
        )}
      </div>
  
      {/* Book Details Section */}
      <div className="lg:flex-1 bg-gray-400 shadow-md rounded-lg p-6 order-1 lg:order-2">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-6">{book.title}</h1>
        <div className="flex flex-col md:flex-row items-center md:justify-between">
          <div className="w-full md:w-1/2 md:pl-8">
            <div className="h-64 md:h-96 w-full flex items-center justify-center overflow-hidden rounded-lg bg-gray-200">
              <img src={book.imageURL} alt={book.title} className="max-h-full max-w-full object-contain" />
            </div>
          </div>
          <div className="w-full md:w-1/2 md:pr-8">
            <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200 p-2" style={{ scrollbarTrackColor: 'transparent' }}>
              <p className="text-gray-700 text-right">{book.summary}</p>
              <p className="text-sm text-gray-500 mt-2 text-right">{book.author}</p>
            </div>
            <div className="mt-4 md:text-right">
              <button
                className={user ? "bg-blue-600 text-white hover:bg-blue-700 font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline" : "bg-blue-300 text-gray-50 font-bold py-3 px-6 rounded opacity-50"}
                onClick={handleOrderNow}
              >
                הזמן עכשיו
              </button>
            </div>
          </div>
        </div>
        {successMessage && (
          <div className="mt-4 px-4 py-2 bg-green-100 border border-green-500 text-green-800 text-xl rounded text-center whitespace-pre-line">
            {successMessage}
          </div>
        )}
      </div>
  
      {/* Recommendations Section */}
      <div className="lg:w-1/4 bg-gray-400 shadow-md rounded-lg p-4 order-3">
        <h2 className="text-xl font-bold mb-4 text-center lg:text-right">המלצות</h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-4xl text-gray-700" />
            <p className="text-xl font-semibold text-gray-700 mr-4">אנחנו מחפשים עבורך את הספרים הטובים ביותר...</p>
          </div>
        ) : (
          <>
            {books.length === 0 ? (
              <p className="text-4xl font-bold text-center">אין לנו המלצות עבורך כרגע, אך תמיד ניתן לפנות לספרנית לעזרה!</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {books.map((book, index) => (
                  <div
                    key={index}
                    className="bg-white shadow-md rounded-lg p-4 cursor-pointer"
                    onClick={() => navigate(`/book/${book.title}`, { state: { book } })}
                  >
                    <div className="h-40 w-full flex items-center justify-center overflow-hidden rounded-lg mb-2 bg-gray-200">
                      <img
                        src={book.imageURL}
                        alt={book.title}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">{book.title}</h2>
                    <p className="text-gray-600">מאת {book.author}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );  
};

export default BookDetailPage;
