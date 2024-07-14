import React, { useState } from "react";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";
import useUser from "../hooks/useUser"; // Import the custom hook to get the user

const UserRequestsPage = () => {
  const { user } = useUser(); // Get the current user details
  const [requestText, setRequestText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    // Validate required field
    if (!requestText.trim()) {
      setError("טקסט הבקשה נדרש.");
      setIsLoading(false);
      return;
    }

    // Prepare the request data
    const requestData = {
      uid: user.uid,
      username: `${user.firstName} ${user.lastName}`,
      requestText,
    };

    try {
      // Send the request data to the server
      const result = await axios.post("/api/requests", requestData);
      if (result.status === 201) {
        setSuccessMessage("הבקשה נשלחה בהצלחה.");
        setError("");
        setRequestText(""); // Clear the input field
      } else {
        setError(`הבקשה נכשלה: ${result.data.message}`);
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      setError(`הבקשה נכשלה: ${error.message}`);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full" dir="rtl">
      <h1 className="text-5xl font-extrabold text-center mb-8 tracking-wide">
        שלח בקשה
      </h1>
      <form
        className="bg-bg-navbar-custom shadow-2xl rounded-lg md:px-16 px-4 pt-10 pb-12 w-full sm:w-3/4 lg:w-1/2"
        onSubmit={handleFormSubmit}
      >
        {/* Request Text */}
        <div className="border-2 bg-gray-700 rounded-lg p-4 mb-4">
          <div className="mb-4">
            <label className="block text-gray-50 text-md mb-2">בקשה</label>
            <textarea
              className="bg-bg-navbar-custom shadow border rounded w-full py-3 px-4 text-gray-50 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="הכנס את הבקשה שלך"
              value={requestText}
              onChange={(e) => setRequestText(e.target.value)}
              rows={5}
            />
          </div>
        </div>

        {/* Submission button */}
        <div className="flex items-center justify-center mt-10 space-x-4">
          <button
            type="submit"
            className="bg-green-600 hover:bg-blue-700 text-gray-50 font-bold py-3 px-6 rounded"
            disabled={isLoading}
          >
            {isLoading ? <FaSpinner className="animate-spin" /> : "שלח בקשה"}
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

export default UserRequestsPage;
