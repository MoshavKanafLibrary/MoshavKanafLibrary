import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

const AddOrUpdateBookPage = () => {
  // State variables for form fields
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [expenditure, setExpenditure] = useState("");
  const [titleType, setTitleType] = useState("books");
  const [locatorCode, setLocatorCode] = useState("");
  const [classification, setClassification] = useState("");
  const [summary, setSummary] = useState("");
  const [copies, setCopies] = useState(0);
  const [copiesID, setCopiesID] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Retrieve bookData from location state
  const location = useLocation();
  const navigate = useNavigate();
  const bookData = location.state?.bookData;
  const isEditMode = Boolean(bookData); // Determine if in update mode

  // Update state with book data on component mount if in edit mode
  useEffect(() => {
    if (bookData) {
      setTitle(bookData.title || "");
      setAuthor(bookData.author || "");
      setImageURL(bookData.imageURL || "");
      setExpenditure(bookData.expenditure || "");
      setTitleType(bookData.titleType || "books");
      setLocatorCode(bookData.locatorCode || "");
      setClassification(bookData.classification || "");
      setSummary(bookData.summary || "");
      setCopies(bookData.copies || 0);
      setCopiesID(bookData.copiesID || []);
    }
  }, [bookData]);

  const handleFormSubmit = async () => {
    setIsLoading(true);

    // Validate required fields
    if (!copiesID.length || !title.trim() || !author.trim()) {
      setError("Title, author, and copy ID are required.");
      setIsLoading(false);
      return;
    }

    const newBookData = {
      title,
      author,
      imageURL,
      expenditure,
      titleType,
      locatorCode,
      classification,
      summary,
      copies,
      copiesID,
    };

    let result;
    try {
      if (isEditMode) {
        // If in update mode, use axios.put to call the update endpoint
        result = await axios.put(`/api/books/update/${bookData.id}`, newBookData);
      } else {
        // If in add mode, use axios.post to call the add endpoint
        result = await axios.post("/api/books/add", newBookData);
      }

      if (result.status === 200) {
        setSuccessMessage("The action was done successfully");
        setError("");
        // Clear form fields if in add mode
        if (!isEditMode) {
          setTitle("");
          setAuthor("");
          setImageURL("");
          setExpenditure("");
          setTitleType("books");
          setLocatorCode("");
          setClassification("");
          setSummary("");
          setCopies(0);
          setCopiesID([]);
        }
      } else {
        setError(`Failed to ${isEditMode ? 'update' : 'add'} the book: ${result.data.message}`);
      }
    } catch (error) {
      console.error("Error adding/updating book:", error);
      setError(`Failed to ${isEditMode ? 'update' : 'add'} the book: ${error.message}`);
    }

    setIsLoading(false);
  };
  
  const headerText = isEditMode ? "Update a book" : "Add a book";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full">
       <h1 className="text-5xl font-extrabold text-center mb-8 tracking-wide">{headerText}</h1>
      <form
        className="bg-bg-navbar-custom shadow-2xl rounded-lg md:px-16 px-4 pt-10 pb-12 w-full sm:w-3/4 lg:w-1/2"
        onSubmit={(e) => {
          e.preventDefault();
          handleFormSubmit();
        }}
      >
        {/* Form fields */}
        {/* Title */}
        <div className="border-2 bg-gray-700 rounded-lg p-4 mb-4">
          <div className="mb-4">
            <label className="block text-gray-50 text-md mb-2">Title</label>
            <input
              className="bg-bg-navbar-custom shadow border rounded w-full py-3 px-4 text-gray-50 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="Enter book title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Author */}
          <div className="mb-4">
            <label className="block text-gray-50 text-md mb-2">Author's Name</label>
            <input
              className="bg-bg-navbar-custom shadow border rounded w-full py-3 px-4 text-gray-50 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="Enter author's name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

          {/* Image URL */}
          <div className="mb-4">
            <label className="block text-gray-50 text-md mb-2">Image URL</label>
            <input
              className="bg-bg-navbar-custom shadow border rounded w-full py-3 px-4 text-gray-50 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="Enter Image URL"
              value={imageURL}
              onChange={(e) => setImageURL(e.target.value)}
            />
          </div>

          {/* Expenditure */}
          <div class="mb-4">
            <label class="block text-gray-50 text-md mb-2">Expenditure</label>
            <input
              class="bg-bg-navbar-custom shadow border rounded w-full py-3 px-4 text-gray-50 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="Enter expenditure"
              value={expenditure}
              onChange={(e) => setExpenditure(e.target.value)}
            />
          </div>

          {/* Title Type */}
          <div class="mb-4">
            <label class="block text-gray-50 text-md mb-2">Title Type</label>
            <select
              class="bg-bg-navbar-custom shadow border rounded w-full py-3 px-4 text-gray-50 leading-tight focus:outline-none focus:shadow-outline"
              value={titleType}
              onChange={(e) => setTitleType(e.target.value)}
            >
              <option value="books">Books</option>
              <option value="magazines">Magazines</option>
              <option value="audio">Audio</option>
            </select>
          </div>

          {/* Locator Code */}
          <div class="mb-4">
            <label class="block text-gray-50 text-md mb-2">Locator Code</label>
            <input
              class="bg-bg-navbar-custom shadow border rounded w-full py-3 px-4 text-gray-50 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="Enter locator code"
              value={locatorCode}
              onChange={(e) => setLocatorCode(e.target.value)}
            />
          </div>

          {/* Classification */}
          <div class="mb-4">
            <label class="block text-gray-50 text-md mb-2">Classification</label>
            <input
              class="bg-bg-navbar-custom shadow border rounded w-full py-3 px-4 text-gray-50 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter classification"
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
            />
          </div>

          {/* Summary */}
          <div class="mb-4">
            <label class="block text-gray-50 text-md mb-2">Summary</label>
            <input
              class="bg-bg-navbar-custom shadow border rounded w-full py-3 px-4 text-gray-50 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          {/* Copies */}
          <div class="mb-4">
            <label class="block text-gray-50 text-md mb-2">Copies</label>
            <input
              type="number"
              placeholder="Enter number of copies"
              value={copies}
              onChange={(e) => {
                const newCopies = parseInt(e.target.value);
                if (!isNaN(newCopies) && newCopies >= 0) {
                  setCopies(newCopies);
                }
              }}
            />
          </div>

          {/* Copy IDs */}
          <div class="mb-4">
            <label class="block text-gray-50 text-md mb-2">Copy IDs</label>
            {Array.from({ length: copies }, (_, index) => (
              <input
                key={index}
                class="bg-bg-navbar-custom shadow border rounded w-full py-3 px-4 text-gray-50 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                placeholder={`Enter ID for copy ${index + 1}`}
                value={copiesID[index]}
                onChange={(e) => {
                  const newCopiesID = [...copiesID];
                  newCopiesID[index] = e.target.value;
                  setCopiesID(newCopiesID);
                }}
              />
            ))}
          </div>

        </div>

        {/* Submission button */}
        <div className="flex items-center justify-center mt-10 space-x-4">
          <button
            type="submit"
            className="bg-green-600 hover:bg-blue-700 text-gray-50 font-bold py-3 px-6 rounded"
          >
            {isEditMode ? "Update Book" : "Add Book"}
          </button>

          {/* Button to go back to ManagerPage */}
          <button
            onClick={() => navigate("/manager")} // Navigate back to ManagerPage
            className="bg-gray-700 hover:bg-gray-800 text-gray-50 font-bold py-3 px-6 rounded"
          >
            Go Back to ManagerPage
          </button>
        </div>

        {/* Error and success messages */}
        {error && (
          <p className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded text-center mt-6">
            {error}
          </p>
        )}

        {successMessage && (
          <p className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded text-center mt-6">
            {successMessage}
          </p>
        )}
      </form>
    </div>
  );
};
export default AddOrUpdateBookPage;