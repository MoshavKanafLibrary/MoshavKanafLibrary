import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserContext from "../contexts/UserContext";
import useUser from "../hooks/useUser";

const MoreInfoPage = () => {
  const { setNavBarDisplayName } = useContext(UserContext);
  const { user, isLoading } = useUser(); // Assuming `useUser` provides a loading state as well
  const [displayName, setDisplayName] = useState("");
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
    if (displayName.length < 4 || displayName.length > 12) {
      setErrorMessage("Display name must be between 4 and 12 characters long.");
      return;
    }
    try {
      const response = await axios.get(`/api/displaynames/${displayName}`);
      if (response.data.valid && user && user.uid) {
        await axios.put(`/api/displaynames/${user.uid}`, { displayName });
        setNavBarDisplayName(displayName);
        navigate("/");
      } else {
        setErrorMessage("Display name is already in use or invalid user data.");
      }
    } catch (error) {
      console.error("Error validating display name", error);
      setErrorMessage(error.message || "Failed to validate display name");
    }
  };

  return (
    <div className="flex items-center justify-center mt-8">
      <form
        className="bg-bg-navbar-custom shadow-2xl rounded md:px-8 px-2 pt-6 pb-8 w-full sm:w-1/2 lg:w-1/3"
        onSubmit={validateAndNavigate}
      >
        <h1 className="text-2xl text-gray-50 font-semibold mx-auto text-center mb-3">
          More Information
        </h1>
        <div className="border-2 border-gray-600 rounded-md p-2 mb-2">
          {user && user.email && (
            <div className="mb-3">
              <label className="block text-gray-50 text-sm mb-2">
                Your Email: {user.email}
              </label>
            </div>
          )}
          {user && user.uid && (
            <div className="mb-3">
              <label className="block text-gray-50 text-sm mb-2">
                Your ID: {user.uid}
              </label>
            </div>
          )}
          <div className="mb-3">
            <label className="block text-gray-50 text-sm mb-2">
              Choose Display Name
            </label>
            <input
              className={
                errorMessage
                  ? "bg-red-200 shadow appearance-none border rounded w-full py-2 px-3 text-gray-50 leading-tight focus:outline-none focus:shadow-outline"
                  : "bg-bg-navbar-custom shadow appearance-none border rounded w-full py-2 px-3 text-gray-50 leading-tight focus:outline-none focus:shadow-outline"
              }
              placeholder="Your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between m-auto">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-gray-50 font-bold py-2 px-4 mx-auto mb-4 rounded focus:outline-none focus:shadow-outline"
          >
            Save
          </button>
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
