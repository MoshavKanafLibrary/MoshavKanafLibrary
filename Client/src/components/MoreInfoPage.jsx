import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useUser from "../hooks/useUser";
import { FaSpinner } from "react-icons/fa";

const MoreInfoPage = () => {
  const { user, isLoading } = useUser(); // Assuming `useUser` provides a loading state as well
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Monitor user data changes and perform actions accordingly
    if (user && !isLoading) {
      console.log("User is now available:", user);
    }
  }, [user, isLoading]);

  const validateAndNavigate = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !phone) {
      setErrorMessage("All fields are required.");
      return;
    }
    try {
      if (user && user.uid) {
        await axios.put(`/api/users/${user.uid}`, { firstName, lastName, phone });
        navigate("/");
      } else {
        setErrorMessage("Invalid user data.");
      }
    } catch (error) {
      console.error("Error updating user data", error);
      setErrorMessage(error.message || "Failed to update user data");
    }
  };

  return (
    <div className="flex items-center justify-center mt-8" dir="rtl">
      <form
        className="bg-[#E7DBCB] shadow-2xl rounded md:px-8 px-2 pt-6 pb-8 w-full sm:w-1/2 lg:w-1/3"
        onSubmit={validateAndNavigate}
      >
        <div className="text-center flex justify-center mb-3">
          <h1 className="text-3xl text-[#7C382A] font-bold mb-5">
            מלא פרטים נוספים
          </h1>
        </div>
        <div className="border-2 bg-[#4B0000] rounded-lg p-4 mb-4">
          {user && user.email && (
            <div className="mb-3">
              <label className="block text-[#E7DBCB] text-sm mb-2">
                כתובת האימייל שלך: {user.email}
              </label>
            </div>
          )}
          {user && user.uid && (
            <div className="mb-3">
              <label className="block text-[#E7DBCB] text-sm mb-2">
                מזהה משתמש: {user.uid}
              </label>
            </div>
          )}
          <div className="mb-3">
            <label className="block text-[#E7DBCB] text-sm mb-2">
              שם פרטי
            </label>
            <input
              className="bg-[#8B0000] shadow appearance-none border rounded w-full py-2 px-3 text-[#E7DBCB] leading-tight focus:outline-none focus:shadow-outline"
              placeholder="הכנס את שמך הפרטי"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="block text-[#E7DBCB] text-sm mb-2">
              שם משפחה
            </label>
            <input
              className="bg-[#8B0000] shadow appearance-none border rounded w-full py-2 px-3 text-[#E7DBCB] leading-tight focus:outline-none focus:shadow-outline"
              placeholder="הכנס את שם משפחתך"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="block text-[#E7DBCB] text-sm mb-2">
              פלאפון
            </label>
            <input
              className="bg-[#8B0000] shadow appearance-none border rounded w-full py-2 px-3 text-[#E7DBCB] leading-tight focus:outline-none focus:shadow-outline"
              placeholder="הכנס את מספר הפלאפון שלך"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between m-auto">
          {isLoading ? (
            <button
              type="button"
              className="bg-blue-400 text-gray-50 font-bold py-2 px-4 mx-auto mb-4 rounded"
              disabled
            >
              <FaSpinner className="animate-spin inline-block h-7 w-7 text-white mr-2" />
              טוען ..
            </button>
          ) : (
            <button
              type="submit"
              className="bg-red-900 hover:bg-blue-700 text-gray-50 font-bold py-2 px-4 mx-auto mb-4 rounded focus:outline-none focus:shadow-outline"
            >
              שמור
            </button>
          )}
        </div>
        {errorMessage && (
          <p className="bg-red-100 border border-red-400 text-red-700 mb-4 px-4 py-3 rounded relative select-none hover:bg-red-200 text-center">
            {errorMessage}
          </p>
        )}
      </form>
    </div>
  );
};

export { MoreInfoPage };
