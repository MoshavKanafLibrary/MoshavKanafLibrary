import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaSpinner} from 'react-icons/fa'; // Removed FaTimes
import { Dialog, Transition } from '@headlessui/react';
import {useNavigate, useLocation} from 'react-router-dom'
import useUser from '../hooks/useUser'

// Import Axios
import axios from 'axios';

const fetchAllBooks = async (page, pageSize, searchQuery = '', selectedCategories = [], selectedAuthors = []) => {
  try {
    const response = await axios.get('/api/books/getAllBooks', {
      params: {
        page,
        pageSize,
        searchQuery,
        categories: selectedCategories.join(','), // Join array with commas
        authors: selectedAuthors.join(','), // Join array with commas        authors: selectedAuthors,
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Unexpected response:", response.statusText);
      return { books: [], totalItems: 0 }; // Return empty on error
    }
  } catch (error) {
    console.error("Error fetching books:", error);
    return { books: [], totalItems: 0 }; // Return empty on exception
  }
};





const uniqueValues = (array, key) => {
  return [...new Set(array.map((item) => item[key]))].sort();
};

const BooksPage = () => {
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const [pageSize] = useState(12); // Items per page
  const [totalBookCount, setTotalBookCount] = useState(0); // Total count of books
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [categories, setCategories] = useState([]); // State for categories
  const [authors, setAuthors] = useState([]); // State for authors
  const { user } = useUser();
  const location = useLocation(); // Destructure location from useLocation hook




  const [initialBooks, setInitialBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterRef = useRef(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // const categories = uniqueValues(books, 'category');
  // const authors = uniqueValues(books, 'author');
  

  const fetchAllCategoriesAndAuthors = async () => {
    const response = await axios.get('/api/books/getCategoriesAndAuthors');
    return response.data; // Expecting an object with categories and authors
  };
  
  useEffect(() => {
    const fetchCategoriesAndAuthors = async () => {
      const data = await fetchAllCategoriesAndAuthors(); // Fetch all unique categories and authors
      setCategories(data.categories); // Update categories state
      setAuthors(data.authors); // Update authors state
    };
  
    fetchCategoriesAndAuthors(); // Fetch once at the beginning
  }, []); // Fetch only when the component is mounted
 
  
  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
  
      const booksData = await fetchAllBooks(currentPage, pageSize, searchQuery, selectedCategories, selectedAuthors);
      
      setBooks(booksData.books); // Update books with the fetched data
      setTotalBookCount(booksData.totalItems); // Update the total book count
      console.log(booksData)
      setIsLoading(false);
    };
  
    fetchBooks();
  }, [currentPage, pageSize, searchQuery, selectedCategories, selectedAuthors]); // Re-fetch when parameters change
  
  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber); // Update the current page
    }
  };
  
  const navigate = useNavigate(); // Initialize navigate function

  const handleCardClick = (book) => {
    const modeValue = location.state && location.state.mode != null ? location.state.mode : 0;
    navigate(`/book/${book.title}`, { state: { book, mode: modeValue } });
  };
  
  
  
  const closePopup = () => {
    setSelectedBook(null);
  };
  
  const toggleFilterDropdown = () => {
    setShowFilterDropdown(!showFilterDropdown);
    setShowCategoryDropdown(false);
    setShowAuthorDropdown(false);
  };

  const toggleCategoryDropdown = () => {
    setShowCategoryDropdown(!showCategoryDropdown);
    setShowAuthorDropdown(false);
  };

  const toggleAuthorDropdown = () => {
    setShowAuthorDropdown(!showAuthorDropdown);
    setShowCategoryDropdown(false);
  };

  const handleMultiSelect = (value, setState, selectedItems) => {
    if (selectedItems.includes(value)) {
      setState(selectedItems.filter((item) => item !== value));
    } else {
      setState([...selectedItems, value]);
    }
  };

  // Close the filter dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // Empty dependency array ensures the effect runs only once when the component mounts

  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(book.category);
    const matchesAuthor = selectedAuthors.length === 0 || selectedAuthors.includes(book.author);
    return matchesSearch && matchesCategory && matchesAuthor;
  });
  // Calculate total pages using `totalBookCount`
  const totalPages = Math.ceil(totalBookCount / pageSize);

  console.log(totalPages)
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="relative pt-20 z-10 h-screen bg-gradient-to-br from-gray-300 via-gray-200 to-gray-100 overflow-x-hidden">
      
      <div>
      {user ? ( // If user is logged in
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-black text-center">Our Books</h1>
      ) : ( // If user is not logged in
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-black text-center">Our Books</h1>
      )}
    </div>      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-4xl text-gray-700" /> {/* Loading spinner */}
          </div>
        ) : (
          <>
             <div className="flex justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <button
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg"
                    onClick={toggleFilterDropdown}
                  >
                    Filter
                  </button>
                  {showFilterDropdown && (
                    <div className="absolute mt-2 bg-gray-800 rounded-lg shadow-lg p-4" ref={filterRef}>
                      <div className="flex flex-col space-y-4">
                        <button
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg"
                          onClick={toggleCategoryDropdown}
                        >
                          Categories
                        </button>
                        {showCategoryDropdown && (
                          <div className="flex flex-col space-y-2">
                            {categories.map((category) => (
                              <label key={category} className="flex items-center">
                                <input
                                  type="checkbox"
                                  className="mr-2"
                                  checked={selectedCategories.includes(category)}
                                  onChange={() => handleMultiSelect(category, setSelectedCategories, selectedCategories)}
                                />
                                <span className="text-white">{category}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        <button
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg"
                          onClick={toggleAuthorDropdown}
                        >
                          Authors
                        </button>
                        {showAuthorDropdown && (
                          <div className="flex flex-col space-y-2">
                            {authors.map((author) => (
                              <label key={author} className="flex items-center">
                                <input
                                  type="checkbox"
                                  className="mr-2"
                                  checked={selectedAuthors.includes(author)}
                                  onChange={() => handleMultiSelect(author, setSelectedAuthors, selectedAuthors)}
                                />
                                <span className="text-white">{author}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              <div className="flex items-center justify-end w-full">
                <FaSearch className="mr-2 text-black" />
                <label className="text-black text-lg mr-2">Search:</label>
                <input
                  type="text"
                  className="bg-gray-700 text-white px-3 py-2 rounded-lg"
                  placeholder="Search by title or author"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"> {/* 4 cards in a row */}
                {filteredBooks.map((book, index) => (
                  <div
                    key={index}
                    className="bg-gray-700 shadow-xl rounded-lg p-4 text-center h-96 w-56 mx-auto cursor-pointer"
                    onClick={() => handleCardClick(book)}
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
                      <p classmd ="text-gray-300">by {book.author}</p>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center mt-8"> {/* Pagination */}
                  {pageNumbers.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      className={`px-4 py-2 mx-2 rounded-lg ${
                        pageNumber === currentPage ? 'bg-gray-500 text-white' : 'bg-gray-700 text-gray-300'
                      }`}
                      onClick={() => goToPage(pageNumber)}
                    >
                      {pageNumber} {/* Pagination number */}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
  
};
export default BooksPage;