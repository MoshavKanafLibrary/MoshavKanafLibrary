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
  const [isAnonymous, setIsAnonymous] = useState(false);
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
        if (response.data.success) {
          setBooks(response.data.books || []); // Ensure books is an array
        } else {
          setBooks([]);
        }
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        setBooks([]);
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
      const reviewData = {
        uid: user.uid,
        review: reviewText.trim(),
        reviewedAt: new Date() // Use JavaScript Date for the new review
      };

      if (!isAnonymous) {
        reviewData.firstName = user.firstName; 
        reviewData.lastName = user.lastName;  
      }

      await axios.post(`/api/books/${book.id}/reviews`, reviewData);
      setSuccessMessage("הביקורת נשלחה בהצלחה!");
      setReviews([...reviews, {
        ...reviewData,
        firstName: isAnonymous ? 'אנונימי' : user.firstName,
        lastName: isAnonymous ? '' : user.lastName,
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
    <div className="min-h-screen py-12" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Book Details Section */}
          <div className="lg:col-span-2 bg-bg-navbar-custom shadow-lg rounded-lg p-8 flex flex-col md:flex-row h-[600px]">
            <div className="md:w-1/2 flex-shrink-0 pl-4">
              <div className="h-full w-full flex items-center justify-center overflow-hidden rounded-lg bg-bg-text">
                <img src={book.imageURL} alt={book.title} className="max-h-full max-w-full object-contain" />
              </div>
            </div>
            <div className="md:w-1/2 md:pl-12 mt-6 md:mt-0 overflow-y-auto">
              <h1 className="text-3xl md:text-4xl font-bold text-bg-text mb-6">{book.title}</h1>
              <p className="text-bg-text mb-4">{book.summary}</p>
              <p className="text-sm text-bg-text mb-6">מאת {book.author}</p>
              <button
                className={user ? "bg-bg-text text-bg-navbar-custom hover:bg-bg-hover font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline" : "bg-bg-text text-bg-navbar-custom font-bold py-3 px-6 rounded opacity-50 cursor-not-allowed"}
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
          <div className="lg:col-span-1 bg-bg-navbar-custom shadow-lg rounded-lg p-6 max-h-[600px] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-center text-bg-text">ביקורות משתמשים</h2>
            <div className="mb-6">
              {user ? (
                <div className="flex flex-col space-y-6">
                  <textarea
                    className="w-full p-3 border border-bg-text rounded focus:outline-none focus:border-bg-background-gradient-from"
                    placeholder="כתוב את הביקורת שלך..."
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                  />
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={e => setIsAnonymous(e.target.checked)}
                      className="mr-2"
                    />
                    <label className="text-bg-text">שלח ביקורת באופן אנונימי</label>
                  </div>
                  <button
                    className="bg-bg-hover text-bg-navbar-custom py-3 px-6 rounded hover:bg-bg-text focus:outline-none"
                    onClick={handleReviewSubmit}
                  >
                    שלח ביקורת
                  </button>
                </div>
              ) : (
                <p className="text-center text-bg-text">עליך להיכנס למערכת כדי לשלוח ביקורת.</p>
              )}
            </div>
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review, index) => (
                  <div key={index} className="bg-bg-text p-4 rounded-lg shadow-md">
                    <p className="font-semibold text-bg-navbar-custom">{review.firstName} {review.lastName}</p>
                    <p className="text-bg-navbar-custom">{review.review}</p>
                    <p className="text-xs text-bg-navbar-custom mt-2">
                      {new Date(review.reviewedAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-bg-text">אין עדיין ביקורות. היה הראשון לכתוב ביקורת!</p>
            )}
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="bg-bg-navbar-custom shadow-lg rounded-lg p-8 mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center text-bg-text">המלצות</h2>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <FaSpinner className="animate-spin text-4xl text-bg-text" />
              <p className="text-xl font-semibold text-bg-text mr-4">אנחנו מחפשים עבורך את הספרים הטובים ביותר...</p>
            </div>
          ) : (
            <>
              {books.length === 0 ? (
                <p className="text-2xl font-bold text-center text-bg-text">אין לנו המלצות עבורך כרגע, אך תמיד ניתן לפנות לספרנית לעזרה!</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {books.map((book, index) => (
                    <div
                      key={index}
                      className="bg-bg-text shadow-md rounded-lg p-6 cursor-pointer"
                      onClick={() => navigate(`/book/${book.title}`, { state: { book } })}
                    >
                      <div className="h-40 w-full flex items-center justify-center overflow-hidden rounded-lg mb-4 bg-bg-hover">
                        <img
                          src={book.imageURL}
                          alt={book.title}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <h2 className="text-xl font-semibold text-bg-navbar-custom">{book.title}</h2>
                      <p className="text-bg-navbar-custom">מאת {book.author}</p>
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
