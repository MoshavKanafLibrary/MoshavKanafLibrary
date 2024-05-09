import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaPlus, FaEdit, FaBook, FaTasks, FaPrint, FaBookReader } from "react-icons/fa";

const ManagerPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get("/api/books/names");
        setError(response.data.success ? "" : "Failed to fetch book names: " + response.data.message);
      } catch (e) {
        setError("Error fetching books: " + e.message);
      }
    };

    fetchBooks();
  }, []);

  const handleNavigate = (path, state = {}) => {
    navigate(path, { state });
  };

  const buttonStyle = "flex items-center justify-center bg-gradient-to-br from-gray-300 via-gray-200 to-gray-100 text-black font-bold py-8 px-4 rounded focus:outline-none focus:shadow-outline hover:from-gray-400 hover:via-gray-300 hover:to-gray-200 space-x-4 w-96";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-50">
      {/* Outer Frame */}
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
        <div className="bg-gray-700 shadow-2xl rounded-lg md:px-20 px-8 pt-24 pb-24 w-full sm:w-3/4 lg:w-1/2">
          {/* Inner Frame */}
          <div className="bg-gray-800 shadow-md rounded-lg px-8 py-12">
            <h1 className="text-6xl text-center font-bold mb-8">Welcome back!</h1>
            <p className="text-2xl text-center mb-12">What would you like to do today?</p>
            <div className="flex justify-center">
              <div className="grid grid-cols-2 gap-8">
                <div className="flex flex-col space-y-8">
                  <button className={buttonStyle} onClick={() => handleNavigate("/AddOrUpdateBook")}>
                    <FaPlus className="text-3xl" />
                    <span className="text-xl">Add a New Book</span>
                  </button>
                  <button className={buttonStyle} onClick={() => handleNavigate("/presentBooks", { mode: 1 })}>
                    <FaEdit className="text-3xl" />
                    <span className="text-xl">Update a Book</span>
                  </button>
                  <button className={buttonStyle} onClick={() => handleNavigate("/searchBook", { mode: 0 })}>
                    <FaBook className="text-3xl" />
                    <span className="text-xl">Order a Book</span>
                  </button>
                </div>
                <div className="flex flex-col space-y-8">
                  <button className={buttonStyle} onClick={() => handleNavigate("/searchBook", { mode: 0 })}>
                    <FaTasks className="text-3xl" />
                    <span className="text-xl">Borrow Requests</span>
                  </button>
                  <button className={buttonStyle} onClick={() => handleNavigate("/searchBook", { mode: 0 })}>
                    <FaBookReader className="text-3xl" />
                    <span className="text-xl">Create Borrow Request for user</span>
                  </button>
                  <button className={buttonStyle} onClick={() => handleNavigate("/searchBook", { mode: 0 })}>
                    <FaPrint className="text-3xl" />
                    <span className="text-xl">Books Reports</span>
                  </button>
                </div>
              </div>
            </div>
            {error && (
              <p className="text-xl bg-red-100 border border-red-400 text-red-700 px-8 py-6 rounded text-center mt-8">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerPage;
