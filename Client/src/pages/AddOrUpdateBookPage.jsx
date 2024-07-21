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

  const location = useLocation();
  const navigate = useNavigate();
  const bookData = location.state?.bookData;
  const isEditMode = Boolean(bookData);

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

    if (!copies || !title.trim() || !author.trim()) {
      setError("שם הספר, שם הסופר ומספר העותקים נדרשים.");
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
        result = await axios.put(`/api/books/update/${bookData.id}`, newBookData);
      } else {
        result = await axios.post("/api/books/add", newBookData);
      }

      if (result.status === 200) {
        setSuccessMessage(isEditMode ? "הספר עודכן בהצלחה" : "הספר נוסף בהצלחה");
        setError("");

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

          await notifyAllUsers(title);
        }
      } else {
        setError(`נכשל ${isEditMode ? 'לעדכן' : 'להוסיף'} את הספר: ${result.data.message}`);
      }
    } catch (error) {
      console.error("Error adding/updating book:", error);
      setError(`נכשל ${isEditMode ? 'לעדכן' : 'להוסיף'} את הספר: ${error.message}`);
    }

    setIsLoading(false);
  };

  const notifyAllUsers = async (bookTitle) => {
    try {
      const usersResponse = await axios.get('/api/users');
      const users = usersResponse.data.users;

      const notificationPromises = users.map(user =>
        axios.post(`/api/users/${user.id}/notifications`, {
          message: `ספר חדש בשם "${bookTitle}" נוסף לספרייה. בדוק אותו עכשיו!`
        })
      );

      await Promise.all(notificationPromises);
      console.log("משתמשים קיבלו התראה על הספר החדש בהצלחה.");
    } catch (error) {
      console.error(`שגיאה בהודעת המשתמשים: ${error.response?.data?.message || error.message}`);
    }
  };

  const headerText = isEditMode ? "עדכן ספר" : "הוסף ספר";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-gray-200 via-gray-400 to-gray-200 text-gray-50" dir="rtl">
      <h1 className="text-5xl font-extrabold text-center mb-8 tracking-wide text-black">{headerText}</h1>
      <form
        className="bg-gray-900 shadow-2xl rounded-lg md:px-16 px-4 pt-10 pb-12 w-full sm:w-3/4 lg:w-1/2"
        onSubmit={(e) => {
          e.preventDefault();
          handleFormSubmit();
        }}
      >
        <div className="border-2 border-gray-700 rounded-lg p-4 mb-4">
          <div className="mb-4">
            <label className="block text-gray-50 text-md mb-2">כותרת</label>
            <input
              className="bg-gray-800 shadow border rounded w-full py-3 px-4 text-gray-50 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="הכנס את כותרת הספר"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-50 text-md mb-2">שם הסופר</label>
            <input
              className="bg-gray-800 shadow border rounded w-full py-3 px-4 text-gray-50 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="הכנס את שם הסופר"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-50 text-md mb-2">קישור לתמונה</label>
            <input
              className="bg-gray-800 shadow border rounded w-full py-3 px-4 text-gray-50 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="הכנס את קישור התמונה"
              value={imageURL}
              onChange={(e) => setImageURL(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-50 text-md mb-2">הוצאה</label>
            <input
              className="bg-gray-800 shadow border rounded w-full py-3 px-4 text-gray-50 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="הכנס את ההוצאה"
              value={expenditure}
              onChange={(e) => setExpenditure(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-50 text-md mb-2">סוג הכותרת</label>
            <select
              className="bg-gray-800 shadow border rounded w-full py-3 px-4 text-gray-50 leading-tight focus:outline-none focus:shadow-outline"
              value={titleType}
              onChange={(e) => setTitleType(e.target.value)}
            >
              <option value="books">ספרים</option>
              <option value="magazines">מגזינים</option>
              <option value="audio">אודיו</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-50 text-md mb-2">קוד מיקום</label>
            <input
              className="bg-gray-800 shadow border rounded w-full py-3 px-4 text-gray-50 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="הכנס את קוד המיקום"
              value={locatorCode}
              onChange={(e) => setLocatorCode(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-50 text-md mb-2">סיווג</label>
            <input
              className="bg-gray-800 shadow border rounded w-full py-3 px-4 text-gray-50 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="הכנס את הסיווג"
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-50 text-md mb-2">תקציר</label>
            <input
              className="bg-gray-800 shadow border rounded w-full py-3 px-4 text-gray-50 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="הכנס את התקציר"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-50 text-md mb-2">עותקים</label>
            <input
              className="bg-gray-800 shadow border rounded w-full py-3 px-4 text-gray-50 leading-tight focus:outline-none focus:shadow-outline"
              type="number"
              placeholder="הכנס את מספר העותקים"
              value={copies}
              onChange={(e) => {
                const newCopies = parseInt(e.target.value);
                if (!isNaN(newCopies) && newCopies >= 0) {
                  setCopies(newCopies);
                }
              }}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-50 text-md mb-2">מספרי עותקים</label>
            {copiesID.map((copyID, index) => (
              <input
                key={index}
                className="bg-gray-800 shadow border rounded w-full py-3 px-4 text-gray-50 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                value={copyID}
                readOnly
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center mt-10 space-x-4">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-gray-50 font-bold py-3 px-6 rounded"
          >
            {isEditMode ? "עדכן ספר" : "הוסף ספר"}
          </button>
        </div>

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
