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
  const [newCopiesCount, setNewCopiesCount] = useState(0);
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
      addedAt: new Date().toISOString(),
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

  const handleAddCopies = async () => {
    try {
      const newCopyIds = [];
      for (let i = 0; i < newCopiesCount; i++) {
        const response = await axios.post(`/api/books/${bookData.id}/addCopy`);
        newCopyIds.push(response.data.copyID);
      }
      setCopiesID([...copiesID, ...newCopyIds]);
      setCopies(copies + newCopiesCount);
      setSuccessMessage("עותקים נוספו בהצלחה.");
    } catch (error) {
      console.error("Error adding copies:", error);
      setError("נכשל להוסיף עותקים: " + error.message);
    }
  };
  
  const handleRemoveCopy = async (copyID) => {
    try {
      await axios.delete(`/api/books/${bookData.id}/removeCopy/${copyID}`);
      setCopiesID(copiesID.filter(id => id !== copyID));
      setCopies(copies - 1);
      setSuccessMessage("עותק הוסר בהצלחה.");
    } catch (error) {
      console.error("Error removing copy:", error);
      setError("נכשל להסיר עותק: " + error.message);
    }
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
<div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-bg-background-gradient-from via-bg-background-gradient-via to-bg-background-gradient-to text-bg-header-custom pt-20" dir="rtl">
  <h1 className="text-5xl font-extrabold text-center mb-8 tracking-wide text-bg-header-custom">{headerText}</h1>
  <form
        className="bg-bg-navbar-custom shadow-2xl rounded-lg px-4 pt-10 pb-12 w-full sm:w-3/4 lg:w-1/2"
        onSubmit={(e) => {
          e.preventDefault();
          handleFormSubmit();
        }}
      >
        <div className="border-2 border-bg-text rounded-lg p-4 mb-4">
          <div className="mb-4">
            <label className="block text-bg-text text-md mb-2">כותרת</label>
            <input
              className="bg-bg-background-textbox shadow border rounded w-full py-3 px-4 text-bg-navbar-custom leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="הכנס את כותרת הספר"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-bg-text text-md mb-2">שם הסופר</label>
            <input
              className="bg-bg-background-textbox shadow border rounded w-full py-3 px-4 text-bg-navbar-custom leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="הכנס את שם הסופר"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-bg-text text-md mb-2">קישור לתמונה</label>
            <input
              className="bg-bg-background-textbox shadow border rounded w-full py-3 px-4 text-bg-navbar-custom leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="הכנס את קישור התמונה"
              value={imageURL}
              onChange={(e) => setImageURL(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-bg-text text-md mb-2">הוצאה</label>
            <input
              className="bg-bg-background-textbox shadow border rounded w-full py-3 px-4 text-bg-navbar-custom leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="הכנס את ההוצאה"
              value={expenditure}
              onChange={(e) => setExpenditure(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-bg-text text-md mb-2">סוג הכותרת</label>
            <select
              className="bg-bg-background-textbox shadow border rounded w-full py-3 px-4 text-bg-navbar-custom leading-tight focus:outline-none focus:shadow-outline"
              value={titleType}
              onChange={(e) => setTitleType(e.target.value)}
            >
              <option value="books">ספרים</option>
              <option value="magazines">מגזינים</option>
              <option value="audio">אודיו</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-bg-text text-md mb-2">קוד מיקום</label>
            <input
              className="bg-bg-background-textbox shadow border rounded w-full py-3 px-4 text-bg-navbar-custom leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="הכנס את קוד המיקום"
              value={locatorCode}
              onChange={(e) => setLocatorCode(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-bg-text text-md mb-2">סיווג</label>
            <input
              className="bg-bg-background-textbox shadow border rounded w-full py-3 px-4 text-bg-navbar-custom leading-tight focus:outline-none focus:shadow-outline"
              placeholder="הכנס את הסיווג"
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-bg-text text-md mb-2">תקציר</label>
            <input
              className="bg-bg-background-textbox shadow border rounded w-full py-3 px-4 text-bg-navbar-custom leading-tight focus:outline-none focus:shadow-outline"
              placeholder="הכנס את התקציר"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-bg-text text-md mb-2">עותקים</label>
            <input
              className="bg-bg-background-textbox shadow border rounded w-full py-3 px-4 text-bg-navbar-custom leading-tight focus:outline-none focus:shadow-outline"
              type="number"
              min={0}
              readOnly={isEditMode}
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
            <label className="block text-bg-text text-md mb-2">מספרי עותקים</label>
            {copiesID.map((copyID, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  className="bg-bg-background-textbox shadow border rounded w-full py-3 px-4 text-bg-navbar-custom leading-tight focus:outline-none focus:shadow-outline"
                  type="text"
                  value={copyID}
                  readOnly
                />
                <button
                  type="button"
                  className="bg-red-600 hover:bg-red-700 text-bg-navbar-custom font-bold py-2 px-4 rounded ml-2"
                  onClick={() => handleRemoveCopy(copyID)}
                >
                  הסר
                </button>
              </div>
            ))}
          </div>

          {isEditMode && (
            <div className="mb-4">
              <label className="block text-bg-text text-md mb-2">הוסף עותקים חדשים</label>
              <input
                className="bg-bg-background-textbox shadow border rounded w-full py-3 px-4 text-bg-navbar-custom leading-tight focus:outline-none focus:shadow-outline"
                type="number"
                placeholder="מספר העותקים להוספה"
                value={newCopiesCount}
                onChange={(e) => {
                  const count = parseInt(e.target.value);
                  if (!isNaN(count) && count >= 0) {
                    setNewCopiesCount(count);
                  }
                }}
              />
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-bg-navbar-custom font-bold py-2 px-4 rounded mt-2"
                onClick={handleAddCopies}
              >
                הוסף עותקים
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center mt-10 space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-bg-navbar-custom font-bold py-3 px-6 rounded w-full sm:w-auto"
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
