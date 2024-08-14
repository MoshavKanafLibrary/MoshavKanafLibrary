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
  const [ratingCategories, setRatingCategories] = useState(['1-2', '3-4', '4-5']); // Define rating categories
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]); // State to hold selected rating categories
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterRef = useRef(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);
  const [showRatingDropdown, setShowRatingDropdown] = useState(false); // State for showing rating dropdown
  const [selectedBook, setSelectedBook] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8; // Number of books per page
  const maxPageNumbersToShow = 5; // Maximum number of page numbers to show at a time

  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = useCallback(debounce((query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on new search
  }, 300), []);

  const handleSearchInputChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    handleSearch(query);
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
    setShowRatingDropdown(false);
  };

  const toggleCategoryDropdown = () => {
    setShowCategoryDropdown(!showCategoryDropdown);
    setShowAuthorDropdown(false);
    setShowRatingDropdown(false);
  };

  const toggleAuthorDropdown = () => {
    setShowAuthorDropdown(!showAuthorDropdown);
    setShowCategoryDropdown(false);
    setShowRatingDropdown(false);
  };

  const toggleRatingDropdown = () => {
    setShowRatingDropdown(!showRatingDropdown);
    setShowCategoryDropdown(false);
    setShowAuthorDropdown(false);
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

  const matchesRating = (book) => {
    if (selectedRatings.length === 0) return true;
    return selectedRatings.some((ratingCategory) => {
      const [min, max] = ratingCategory.split('-').map(Number);
      return book.averageRating >= min && book.averageRating <= max;
    });
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(book.category);
    const matchesAuthor = selectedAuthors.length === 0 || selectedAuthors.includes(book.author);
    const matchesRatings = matchesRating(book); // New rating filter logic
    return matchesSearch && matchesCategory && matchesAuthor && matchesRatings;
  });

  const paginatedBooks = filteredBooks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalPages = Math.ceil(filteredBooks.length / pageSize);

  const handleCardClick = (book) => {
    const modeValue = location.state && location.state.mode != null ? location.state.mode : 0;
    navigate(`/book/${book.title}`, { state: { book, mode: modeValue } });
  };

  const getStars = (rating) => {
    if (rating === null) {
      return 'N/A';
    }
    const goldStars = Math.floor(rating); // Number of gold stars
    const grayStars = 5 - goldStars; // Number of gray stars

    return (
      <span className="text-yellow-500 inline-block">
        {'★'.repeat(goldStars)}
        <span className="text-gray-500">
          {'☆'.repeat(grayStars)}
        </span>
      </span>
    );
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const halfRange = Math.floor(maxPageNumbersToShow / 2);
    let startPage = Math.max(currentPage - halfRange, 1);
    let endPage = Math.min(startPage + maxPageNumbersToShow - 1, totalPages);

    if (endPage - startPage < maxPageNumbersToShow - 1) {
      startPage = Math.max(endPage - maxPageNumbersToShow + 1, 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`px-4 py-2 mx-2 rounded-lg ${i === currentPage ? 'bg-bg-header-custom text-black' : 'bg-bg-header-custom text-black hover:bg-bg-hover hover:text-white'}`}
          onClick={() => goToPage(i)}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="relative pt-20 z-10 h-screen overflow-x-hidden" dir="rtl">
      <div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-bg-header-custom text-center">הספרים שלנו</h1>
      </div>
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-4xl text-bg-header-custom" />
          </div>
        ) : (
          <>
            <div className="flex justify-between mb-4">
              <div className="flex items-center space-x-4">
                <button
                  className="bg-bg-header-custom text-black px-4 py-2 rounded-lg"
                  onClick={toggleFilterDropdown}
                >
                  סנן
                </button>
                {showFilterDropdown && (
                  <div className="absolute mt-2 bg-bg-header-custom rounded-lg shadow-lg p-4" ref={filterRef}>
                    <div className="flex flex-col space-y-4">
                      <button
                        className="bg-bg-header-custom text-black px-4 py-2 rounded-lg"
                        onClick={toggleCategoryDropdown}
                      >
                        קטגוריות
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
                              <span className="text-black">{category}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      <button
                        className="bg-bg-header-custom text-black px-4 py-2 rounded-lg"
                        onClick={toggleAuthorDropdown}
                      >
                        סופרים
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
                              <span className="text-black">{author}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      <button
                        className="bg-bg-header-custom text-black px-4 py-2 rounded-lg"
                        onClick={toggleRatingDropdown}
                      >
                        דירוגים
                      </button>
                      {showRatingDropdown && (
                        <div className="flex flex-col space-y-2">
                          {ratingCategories.map((ratingCategory) => (
                            <label key={ratingCategory} className="flex items-center">
                              <input
                                type="checkbox"
                                className="mr-2"
                                checked={selectedRatings.includes(ratingCategory)}
                                onChange={() => handleMultiSelect(ratingCategory, setSelectedRatings, selectedRatings)}
                              />
                              <span className="text-black">{ratingCategory}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end w-full">
                <FaSearch className="mr-2 text-bg-header-custom" />
                <label className="text-bg-header-custom text-lg mr-2">חפש:</label>
                <input
                  type="text"
                  className="bg-bg-header-custom text-black px-3 py-2 rounded-lg"
                  placeholder="חפש לפי כותרת או סופר"
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
                    className="bg-bg-header-custom shadow-xl rounded-lg p-4 text-center h-96 w-56 mx-auto cursor-pointer"
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
                      <h2 className="text-xl font-semibold text-black">{book.title}</h2>
                      <p className="text-black">מאת <span className="text-black">{book.author}</span></p>
                      <p className="text-black"><span className="text-black">{book.averageRating === 'N/A' ? 'N/A' : getStars(book.averageRating)}</span></p>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 ">
                  <button
                    className="px-4 py-2 mx-2 rounded-lg bg-bg-header-custom text-black"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    {'<'}
                  </button>
                  {renderPageNumbers()}
                  <button
                    className="px-4 py-2 mx-2 rounded-lg bg-bg-header-custom text-black"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    {'>'}
                  </button>
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
