import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { FaSpinner } from "react-icons/fa";

function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    setIsLoading(true);
    const auth = getAuth();

    sendPasswordResetEmail(auth, email)
      .then(() => {
        setIsLoading(false);
        navigate('/login'); // Redirect to login page after email sent
      })
      .catch((error) => {
        setError(error.message.replace("Firebase:", "").trim());
        setIsLoading(false);
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email) {
      setError("נא להזין את כתובת האימייל שלך");
      return;
    }
    handleResetPassword();
  };

  return (
    <div className="mt-8" dir="rtl">
      <div className="flex items-center justify-center">
        <form
          className="bg-bg-navbar-custom shadow-2xl rounded md:px-8 px-2 pt-6 pb-8 w-full sm:w-1/2 lg:w-1/3"
          onSubmit={handleSubmit}
        >
          <div className="text-center flex justify-center mb-3">
            <h1 className="text-3xl text-gray-50 font-bold mb-5">
              איפוס סיסמה
            </h1>
          </div>
          <div className="border-2 bg-gray-700 rounded-lg p-4 mb-4">
            <div className="mb-4">
              <label className="block text-gray-50 text-sm mb-2">
                כתובת אימייל
              </label>
              <input
                className="bg-bg-navbar-custom shadow appearance-none border rounded w-full py-2 px-3
                  text-gray-50 leading-tight focus:outline-none focus:shadow-outline
                  focus:border-blue-500"
                type="text"
                placeholder="הכנס את כתובת האימייל שלך"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {isLoading ? (
              <button
                className="bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 w-full rounded"
                type="button"
                disabled={true}
              >
                <FaSpinner className="animate-spin inline-block h-7 w-7 text-white mr-2" />
                שולח...
              </button>
            ) : (
              <button
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 w-full rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                שלח אימייל איפוס סיסמה
              </button>
            )}
          </div>
          {error && (
            <p className="bg-red-100 border border-red-400 text-red-700 mb-4 px-4 py-3 rounded relative select-none hover:bg-red-200 text-center">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
