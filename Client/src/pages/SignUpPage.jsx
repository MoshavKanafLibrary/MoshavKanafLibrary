import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import  useUser  from "../hooks/useUser";
import { signUp } from "../components/Auth";
import { auth } from "../components/FireBaseAuth";
import { FaSpinner } from "react-icons/fa";
import { MoreInfoPage } from "../components/MoreInfoPage.jsx"
const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [hasClickedCreateAccount, setHasClickedCreateAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddMoreInfo, setShowAddMoreInfo] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();

  const createAccount = async () => {
    setIsLoading(true); // Add this line
    setHasClickedCreateAccount(true);

    if (password !== confirmPassword) {
      setError("Password and confirm password do not match.");
      console.log("password not match confirmPassword");
      setIsLoading(false); // Add this line
      return;
    }
    let result = await signUp(auth, email, password);
    if (result.status) {
      console.log("User created successfully.");
      setShowAddMoreInfo(true);
    } else {
      console.log("User creation failed:", result.message);
      setError(result.message.replace("Firebase:", "").trim());
    }
    setIsLoading(false); // Add this line
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <>
      {showAddMoreInfo && user ? (
        <MoreInfoPage userProp={user} />
      ) : (
        <div className="flex items-center justify-center mt-8">
          <form
            className="bg-bg-navbar-custom shadow-2xl rounded md:px-8 px-2 pt-6 pb-8  w-full sm:w-1/2  lg:w-1/3  "
            onSubmit={handleSubmit}
          >
              <div className="text-center flex justify-center mb-3">
                <h1 className="text-3xl text-gray-50 font-bold mb-5"> 
                  Create an account
                </h1>
              </div>

            <div className="border-2 bg-gray-700 rounded-lg p-4 mb-4">
              <div className="mb-4">
                <label className="block text-gray-50 text-sm  mb-2">
                  Email Address
                </label>
                <input
                  className={
                    (error == "Firebase: Error (auth/invalid-email)." ||
                      email == "") &&
                    hasClickedCreateAccount
                      ? "bg-red-200 shadow appearance-none border rounded w-full py-2 px-3 text-gray-50 leading-tight focus:outline-none focus:shadow-outline"
                      : "bg-bg-navbar-custom shadow appearance-none border rounded w-full py-2 px-3 text-gray-50 leading-tight focus:outline-none focus:shadow-outline"
                  }
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-50 text-sm mb-2">
                  Password
                </label>
                <input
                  className={
                    password == "" && hasClickedCreateAccount
                      ? "bg-red-200 shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-50 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                      : "bg-bg-navbar-custom shadow appearance-none border  rounded w-full py-2 px-3 text-gray-50 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                  }
                  type="password"
                  placeholder="your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-50 text-sm mb-2">
                  Confirm Password
                </label>
                <input
                  className={
                    (password != confirmPassword || confirmPassword == "") &&
                    hasClickedCreateAccount
                      ? "bg-red-200 shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-50 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                      : "bg-bg-navbar-custom shadow appearance-none border  rounded w-full py-2 px-3 text-gray-50 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                  }
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between m-auto">
              {isLoading ? (
                <button
                  onClick={createAccount}
                  className=" bg-blue-400  text-gray-50 font-bold py-2 px-4 mx-auto mb-4 rounded "
                  disabled={true}
                >
                  <FaSpinner className="animate-spin inline-block h-7 w-7 text-white mr-2" />
                  Loading ..
                </button>
              ) : (
                <button
                  onClick={createAccount}
                  className=" bg-blue-500 hover:bg-blue-700 text-gray-50 font-bold py-2 px-4 mx-auto mb-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Create Account
                </button>
              )}
            </div>
            {error && hasClickedCreateAccount && (
              <p className="bg-red-100 border border-red-400 text-red-700 mb-4 px-4 py-3 rounded relative select-none hover:bg-red-200 text-center">
                {error}
              </p>
            )}

            <div className="flex flex-col items-center justify-center md:flex-row md:justify-center md:items-center space-y-4 md:space-x-4 md:space-y-0 mt-4 border-2 border-gray-600 rounded-md py-4 px-6">
              <h2 className="text-gray-50 ">Already have an account?</h2>
              <Link
                className="text-blue-500  rounded focus:outline-none focus:shadow-outline"
                to="/login"
              >
                log in here
              </Link>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default SignUpPage;