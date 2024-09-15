import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useUser from "../hooks/useUser";
import { signUp } from "../components/Auth";
import { auth } from "../components/FireBaseAuth";
import { FaSpinner } from "react-icons/fa";
import axios from "axios";

const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [firstName, setFirstName] = useState(""); // New field
  const [lastName, setLastName] = useState(""); // New field
  const [familySize, setfamilySize] = useState(""); // New field
  const [phone, setPhone] = useState(""); // New field
  const [error, setError] = useState("");
  const [hasClickedCreateAccount, setHasClickedCreateAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();

  const createAccount = async () => {
    setIsLoading(true);
    setHasClickedCreateAccount(true);

    if (password !== confirmPassword) {
      setError("הסיסמה ואימות הסיסמה אינם תואמים.");
      setIsLoading(false);
      return;
    }

    if (displayName.length < 4 || displayName.length > 12) {
      setError("שם התצוגה חייב להיות בין 4 ל-12 תווים.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(`/api/displaynames/${displayName}`);
      if (!response.data.valid) {
        setError("שם התצוגה כבר בשימוש.");
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error("שגיאה באימות שם התצוגה", error);
      setError("נכשל באימות שם התצוגה.");
      setIsLoading(false);
      return;
    }

    let result = await signUp(auth, email, password, displayName, firstName, lastName, familySize, phone);
    if (result.status) {
      console.log("המשתמש נוצר בהצלחה.");
      try {
        const userResponse = await axios.post("/api/users/signUp", {
          uid: result.user.uid,
          email,
          displayName,
          firstName, // New field
          lastName, // New field
          familySize,
          phone, // New field
        });
        if (userResponse.status === 200) {
          navigate("/");
        } else {
          setError("נכשל בשמירת פרטי המשתמש.");
        }
      } catch (error) {
        console.error("שגיאה ביצירת המשתמש", error);
        setError("נכשל ביצירת המשתמש.");
      }
    } else {
      console.log("נכשל ביצירת משתמש:", result.message);
      setError(result.message.replace("Firebase:", "").trim());
    }
    setIsLoading(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    createAccount();
  };

  return (
    <div className="flex items-center justify-center mt-8" dir="rtl">
      <form
        className="bg-bg-navbar-custom shadow-2xl rounded md:px-8 px-2 pt-6 pb-8 w-full sm:w-1/2 lg:w-1/3"
        onSubmit={handleSubmit}
      >
        <div className="text-center flex justify-center mb-3">
          <h1 className="text-3xl text-bg-text font-bold mb-5">
            צור חשבון
          </h1>
        </div>

        <div className="border-2 bg-bg-background-gradient-via rounded-lg p-4 mb-4">
          <div className="mb-4">
            <label className="block text-bg-navbar-custom text-sm mb-2">
              כתובת אימייל
            </label>
            <input
              className={
                (error === "Firebase: Error (auth/invalid-email)." ||
                  email === "") &&
                hasClickedCreateAccount
                  ? "bg-red-200 shadow appearance-none border rounded w-full py-2 px-3 text-bg-background-gradient-from leading-tight focus:outline-none focus:shadow-outline"
                  : "bg-bg-hover shadow appearance-none border rounded w-full py-2 px-3 text-bg-navbar-custom leading-tight focus:outline-none focus:shadow-outline"
              }
              placeholder="הכנס את כתובת האימייל שלך"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="block text-bg-navbar-custom text-sm mb-2">
              סיסמה
            </label>
            <input
              className={
                password === "" && hasClickedCreateAccount
                  ? "bg-red-200 shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-bg-background-gradient-from mb-3 leading-tight focus:outline-none focus:shadow-outline"
                  : "bg-bg-hover shadow appearance-none border rounded w-full py-2 px-3 text-bg-navbar-custom mb-3 leading-tight focus:outline-none focus:shadow-outline"
              }
              type="password"
              placeholder="הכנס סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="block text-bg-navbar-custom text-sm mb-2">
              אימות סיסמה
            </label>
            <input
              className={
                (password !== confirmPassword || confirmPassword === "") &&
                hasClickedCreateAccount
                  ? "bg-red-200 shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-bg-background-gradient-from mb-3 leading-tight focus:outline-none focus:shadow-outline"
                  : "bg-bg-hover shadow appearance-none border rounded w-full py-2 px-3 text-bg-navbar-custom mb-3 leading-tight focus:outline-none focus:shadow-outline"
              }
              type="password"
              placeholder="הכנס שוב את הסיסמה"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="block text-bg-navbar-custom text-sm mb-2">
              שם תצוגה
            </label>
            <input
              className={
                error && error.includes("שם התצוגה")
                  ? "bg-red-200 shadow appearance-none border rounded w-full py-2 px-3 text-bg-background-gradient-from leading-tight focus:outline-none focus:shadow-outline"
                  : "bg-bg-hover shadow appearance-none border rounded w-full py-2 px-3 text-bg-navbar-custom leading-tight focus:outline-none focus:shadow-outline"
              }
              placeholder="הכנס שם תצוגה"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="block text-bg-navbar-custom text-sm mb-2">
              שם פרטי
            </label>
            <input
              className="bg-bg-hover shadow appearance-none border rounded w-full py-2 px-3 text-bg-navbar-custom leading-tight focus:outline-none focus:shadow-outline"
              placeholder="הכנס את שמך הפרטי"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="block text-bg-navbar-custom text-sm mb-2">
              שם משפחה
            </label>
            <input
              className="bg-bg-hover shadow appearance-none border rounded w-full py-2 px-3 text-bg-navbar-custom leading-tight focus:outline-none focus:shadow-outline"
              placeholder="הכנס את שם משפחתך"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="block text-bg-navbar-custom text-sm mb-2">
              מספר נפשות במשפחה
            </label>
            <input
              className="bg-bg-hover shadow appearance-none border rounded w-full py-2 px-3 text-bg-navbar-custom leading-tight focus:outline-none focus:shadow-outline"
              placeholder="הכנס את מספר הנפשות במשפחה"
              value={familySize}
              onChange={(e) => setfamilySize(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="block text-bg-navbar-custom text-sm mb-2">
              פלאפון
            </label>
            <input
              className="bg-bg-hover shadow appearance-none border rounded w-full py-2 px-3 text-bg-navbar-custom leading-tight focus:outline-none focus:shadow-outline"
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
              className="bg-blue-400 text-bg-navbar-custom font-bold py-2 px-4 mx-auto mb-4 rounded"
              disabled
            >
              <FaSpinner className="animate-spin inline-block h-7 w-7 text-white mr-2" />
              טוען ..
            </button>
          ) : (
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-bg-navbar-custom font-bold py-2 px-4 mx-auto mb-4 rounded focus:outline-none focus:shadow-outline"
            >
              צור חשבון
            </button>
          )}
        </div>
        {error && hasClickedCreateAccount && (
          <p className="bg-red-100 border border-red-400 text-red-700 mb-4 px-4 py-3 rounded relative select-none hover:bg-red-200 text-center">
            {error}
          </p>
        )}

        <div className="flex flex-col items-center justify-center md:flex-row md:justify-center md:items-center space-y-4 md:space-x-4 md:space-y-0 mt-4 border-2 border-bg-background-gradient-from rounded-md py-4 px-6">
          <h2 className="text-bg-background-gradient-from">כבר יש לך חשבון?</h2>
          <Link
            className="text-blue-500 rounded focus:outline-none focus:shadow-outline"
            to="/login"
          >
            התחבר כאן
          </Link>
        </div>
      </form>
    </div>
  );
};

export default SignUpPage;
