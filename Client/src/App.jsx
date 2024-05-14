import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Homepage from "./pages/Homepage";
import NotFoundPage from "./pages/NotFoundPage";
import Navbar from "./components/Navbar"; // Import the Navbar component
import SignUpPage from "./pages/SignUpPage";
import WaitingListPage from "./pages/WaitingListPage";
import LoginPage from "./pages/LoginPage";
import BooksPage from "./pages/BooksPage";
import AddOrUpdateBookPage from "./pages/AddOrUpdateBookPage";
import ProfilePage from "./pages/ProfilePage";
import ContactPage from "./pages/ContactPage";
import ManagerPage from "./pages/ManagerPage";
import BookDetailPage from "./pages/BookDetailPage";
import PresentBooksPage from "./pages/PresentBooksPage";
import ResetPasswordPage from "./pages/resetPasswordPage";
import AllBooksPage from "./pages/AllBooksPage";
import BookBorrowDetailsPage from "./pages/BookBorrowDetailsPage";
import useUser from "./hooks/useUser"; // Import the useUser hook

function App() {
  const { user } = useUser();

  // Function to check if the user is an admin
  const isAdmin = () => {
    console.log(user);
    return user && user.isManager; // Assuming the isAdmin property is called isManager
  };

  return (
    <BrowserRouter>
      <div className="relative z-20">
        <Navbar />
      </div>
      <div className="relative pt-20 z-10 h-screen bg-gradient-to-br from-gray-300 via-gray-200 to-gray-100 overflow-x-hidden">
        <Routes>
          <Route path="/" element={<BooksPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/searchbook" element={<BooksPage />} />
          <Route path="/presentbooks" element={<PresentBooksPage />} />
          <Route path="/addOrUpdatebook" element={<AddOrUpdateBookPage />} />
          <Route path="/addOrUpdatebook/:bookId?" element={<AddOrUpdateBookPage />} />
          <Route path="/WaitingList" element={<WaitingListPage />} />
          <Route path="/AllBooks" element={<AllBooksPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/contactus" element={<ContactPage />} />
          <Route path="/BookBorrowDetails/:bookId?" element={<BookBorrowDetailsPage />} />
          {isAdmin() && <Route path="/manager" element={<ManagerPage />} />} {/* Render the ManagerPage route only if user is admin */}
          <Route path="/book/:bookName" element={<BookDetailPage />} />
          <Route path="/resetpassword" element={<ResetPasswordPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
