import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa'; // Import FaSpinner from react-icons/fa
import useUser from '../hooks/useUser';
import ScrollArea from 'react-scrollbar';

const BookDetailPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { book, mode } = state;

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const { user } = useUser();

  useEffect(() => {
    if (!book) {
      navigate('/'); // Redirect to homepage if book data is not available
      return;
    }
    setLoading(true);

    // Make an API call to fetch books from the server
    axios.get('/api/books/getBooksMatchingTitles', {
      params: { bookName: book.title }
    })
      .then(response => {
        // If the request is successful, update the books array with the received data
        setBooks(response.data);
        setLoading(false); // Set loading to false when data is fetched
        console.log("Books loaded from the server:", response.data);
      })
      .catch(error => {
        // Handle any errors that occur during the request
        setLoading(false); // Set loading to false in case of error
        console.error("Error fetching books:", error.message);
      });
  }, [book, navigate]);

  const handleOrderNow = () => {
    if (!user) {
      alert("You have to login");
    } else {
      axios.post(`/api/books/${book.id}/waiting-list`, { uid: user.uid })
        .then(response => {
          setSuccessMessage("You have been added to the waiting list");
        })
        .catch(error => {
          console.error("Error adding to waiting list:", error.response ? error.response.data.message : error.message);
          alert(`${error.response ? error.response.data.message : "Server error"}`);
        });
    }
  };

  
  return (
    <>
      {loading && ( // Overlay with spinner if loading is true
        <div className="fixed top-0 left-0 w-full h-full bg-black opacity-50 flex justify-center items-center z-50">
          <FaSpinner className="animate-spin text-white text-6xl" />
        </div>
      )}
      <div className={`container mx-auto px-2 md:px-4 py-8 max-w-xl bg-gray-400 shadow-md rounded-lg relative mt-10 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
        <h1 className="text-3xl md:text-4xl font-bold text-center text-black mb-6">{book.title}</h1>
        <div className="flex flex-col md:flex-row items-center md:justify-between">
          <div className="w-full md:w-1/2 md:pr-8">
            <img src={book.imageURL} alt={book.title} className="w-full h-64 md:h-96 object-cover rounded-lg" />
          </div>
          <div className="w-full md:w-1/2 md:pl-8">
          <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200" style={{ scrollbarTrackColor: 'transparent' }}>
  <p className="text-gray-700 text-right pr-2">{book.summary}</p>
  <p className="text-sm text-gray-500 mt-2 text-right pr-2">{book.author}</p>
</div>





            <div className="mt-4 md:text-right">
              <button 
                className={user ? "bg-gray-700 text-white hover:bg-blue-700 text-gray-50 font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline" : "bg-gray-700 text-gray-50 font-bold py-3 px-6 rounded opacity-50"}
                onClick={handleOrderNow}
              >
                Order now
              </button>
            </div>
            {successMessage && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-full mt-2 px-4 py-0 bg-green-100 border border-green-500 text-green-800 text-sm rounded text-center">
                {successMessage}
              </div>
            )}
          </div>
        </div>
      </div>
        
      {/* Recommendations Section */}
      <div className={`container mx-auto px-4 py-8 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
        {books.length === 0 ? (
          <p className="text-4xl font-bold text-center">Currently we don't have recommendations for you. You can assist the librarian :)</p>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-4 text-center">You might also want to read...</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {/* Your book display logic goes here */}
            </div>
          </>
        )}
      </div>
        
      {/* Display Recommendations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
        {books.map((book, index) => (
          <div
            key={index}
            className="bg-gray-700 shadow-xl rounded-lg p-4 text-center h-96 w-56 mx-auto cursor-pointer"
            onClick={() => navigate(`/book/${book.title}`, { state: { book } })}
          >
            <div className="h-4/5 w-full">
              <img
                src={book.imageURL}
                alt={book.title}
                className="h-full w-full object-cover rounded-lg"
              />
            </div>
            <div className="h-1/5">
              <h2 className="text-xl font-semibold text-white">{book.title}</h2>
              <p className="text-gray-300">by {book.author}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
  
  
};  
  

export default BookDetailPage;
