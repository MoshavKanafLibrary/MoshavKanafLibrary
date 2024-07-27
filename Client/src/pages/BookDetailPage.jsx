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
        firstName: user.firstName, // השתמש בשם פרטי
        lastName: user.lastName,   // השתמש בשם משפחה
        review: reviewText.trim(),
        reviewedAt: new Date() // Use JavaScript Date for the new review
      });
      setSuccessMessage("הביקורת נשלחה בהצלחה!");
      setReviews([...reviews, {
        uid: user.uid,
        firstName: user.firstName,
        lastName: user.lastName,
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
    <div className="bg-gradient-to-br from-[#4B0000] via-[#8B0000] to-[#4B0000] min-h-screen py-12" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Book Details Section */}
          <div className="lg:col-span-2 bg-[#E7DBCB] shadow-lg rounded-lg p-8 flex flex-col md:flex-row h-[600px]">
            <div className="md:w-1/2 flex-shrink-0 pl-4">
              <div className="h-full w-full flex items-center justify-center overflow-hidden rounded-lg bg-[#7C382A]">
                <img src={book.imageURL} alt={book.title} className="max-h-full max-w-full object-contain" />
              </div>
            </div>
            <div className="md:w-1/2 md:pl-12 mt-6 md:mt-0 overflow-y-auto">
              <h1 className="text-3xl md:text-4xl font-bold text-[#7C382A] mb-6">{book.title}</h1>
              <p className="text-[#7C382A] mb-4">{book.summary}</p>
              <p className="text-sm text-[#7C382A] mb-6">מאת {book.author}</p>
              <button
                className={user ? "bg-[#7C382A] text-[#E7DBCB] hover:bg-[#4B0000] font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline" : "bg-[#7C382A] text-[#E7DBCB] font-bold py-3 px-6 rounded opacity-50 cursor-not-allowed"}
                onClick={handleOrderNow}
              >
                הזמן עכשיו
              </button>
              {successMessage && (
                <div className="mt-6 px-6 py-4 bg-green-100 border border-green-500 text-green-800 text-xl rounded text-center whitespace-pre-line">
                  {successMessage}
                </div>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="lg:col-span-1 bg-[#E7DBCB] shadow-lg rounded-lg p-6 max-h-[600px] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-center text-[#7C382A]">ביקורות משתמשים</h2>
            <div className="mb-6">
              {user ? (
                <div className="flex flex-col space-y-6">
                  <textarea
                    className="w-full p-3 border border-[#7C382A] rounded focus:outline-none focus:border-[#4B0000]"
                    placeholder="כתוב את הביקורת שלך..."
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                  />
                  <button
                    className="bg-[#4B0000] text-[#E7DBCB] py-3 px-6 rounded hover:bg-[#7C382A] focus:outline-none"
                    onClick={handleReviewSubmit}
                  >
                    שלח ביקורת
                  </button>
                </div>
              ) : (
                <p className="text-center text-[#7C382A]">עליך להיכנס למערכת כדי לשלוח ביקורת.</p>
              )}
            </div>
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review, index) => (
                  <div key={index} className="bg-[#7C382A] p-4 rounded-lg shadow-md">
                    <p className="font-semibold text-[#E7DBCB]">{review.firstName} {review.lastName}</p>
                    <p className="text-[#E7DBCB]">{review.review}</p>
                    <p className="text-xs text-[#E7DBCB] mt-2">
                      {new Date(review.reviewedAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[#7C382A]">אין עדיין ביקורות. היה הראשון לכתוב ביקורת!</p>
            )}
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="bg-[#E7DBCB] shadow-lg rounded-lg p-8 mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center text-[#7C382A]">המלצות</h2>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <FaSpinner className="animate-spin text-4xl text-[#7C382A]" />
              <p className="text-xl font-semibold text-[#7C382A] mr-4">אנחנו מחפשים עבורך את הספרים הטובים ביותר...</p>
            </div>
          ) : (
            <>
              {books.length === 0 ? (
                <p className="text-2xl font-bold text-center text-[#7C382A]">אין לנו המלצות עבורך כרגע, אך תמיד ניתן לפנות לספרנית לעזרה!</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {books.map((book, index) => (
                    <div
                      key={index}
                      className="bg-[#7C382A] shadow-md rounded-lg p-6 cursor-pointer"
                      onClick={() => navigate(`/book/${book.title}`, { state: { book } })}
                    >
                      <div className="h-40 w-full flex items-center justify-center overflow-hidden rounded-lg mb-4 bg-[#4B0000]">
                        <img
                          src={book.imageURL}
                          alt={book.title}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <h2 className="text-xl font-semibold text-[#E7DBCB]">{book.title}</h2>
                      <p className="text-[#E7DBCB]">מאת {book.author}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
