import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import useUser from '../hooks/useUser';
import axios from 'axios';
import { debounce } from 'lodash';

// Fetch all books at once
const fetchAllBooks = async () => {
  try {
    const response = await axios.get('/api/books/getAllBooksData');
    return response.status === 200 ? response.data : { books: [] };
  } catch (error) {
    console.error("Error fetching books:", error);
    return { books: [] };
  }
};

const fetchAllCategoriesAndAuthors = async () => {
  try {
    const response = await axios.get('/api/books/getCategoriesAndAuthors');
    return response.status === 200 ? response.data : { categories: [], authors: [] };
  } catch (error) {
    console.error('Error fetching categories and authors:', error);
    return { categories: [], authors: [] };
  }
};

const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterRef = useRef(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8; // Number of books per page

  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = useCallback(debounce((query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on new search
  }, 300), []);

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    const fetchBooksAndFilters = async () => {
      setIsLoading(true);

      const booksData = await fetchAllBooks();
      const filtersData = await fetchAllCategoriesAndAuthors();

      setBooks(booksData.books);
      setCategories(filtersData.categories);
      setAuthors(filtersData.authors);

      setIsLoading(false);
    };

    fetchBooksAndFilters();
  }, []);

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
  }, []);

  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(book.category);
    const matchesAuthor = selectedAuthors.length === 0 || selectedAuthors.includes(book.author);
    return matchesSearch && matchesCategory && matchesAuthor;
  });

  const paginatedBooks = filteredBooks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalPages = Math.ceil(filteredBooks.length / pageSize);

  const handleCardClick = (book) => {
    const modeValue = location.state && location.state.mode != null ? location.state.mode : 0;
    navigate(`/book/${book.title}`, { state: { book, mode: modeValue } });
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="relative pt-20 z-10 h-screen bg-gradient-to-br from-gray-300 via-gray-200 to-gray-100 overflow-x-hidden">
      <div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-black text-center">Our Books</h1>
      </div>
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-4xl text-gray-700" />
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
                  onChange={handleSearchInputChange}
                />
              </div>
            </div>
            <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {paginatedBooks.map((book, index) => (
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
                      <p className="text-gray-300">by <span className="text-gray-300">{book.author}</span></p>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  {[...Array(totalPages)].map((_, pageNumber) => (
                    <button
                      key={pageNumber + 1}
                      className={`px-4 py-2 mx-2 rounded-lg ${pageNumber + 1 === currentPage ? 'bg-gray-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                      onClick={() => goToPage(pageNumber + 1)}
                    >
                      {pageNumber + 1}
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
