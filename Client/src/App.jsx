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
import UserRequestsPage from "./pages/UserRequestsPage";
import ProfilePage from "./pages/ProfilePage";
import ContactPage from "./pages/ContactPage";
import BookDetailPage from "./pages/BookDetailPage";
import PresentBooksPage from "./pages/PresentBooksPage";
import ResetPasswordPage from "./pages/resetPasswordPage";
import AllBooksPage from "./pages/AllBooksPage";
import BookBorrowDetailsPage from "./pages/BookBorrowDetailsPage";
import AllUsersPage from "./pages/AllUsersPage";
import BorrowedCopiesPage from "./pages/BorrowedCopiesPage";
import PermissionsPage from "./pages/PermissionsPage";
import CreateRequestForUserPage from "./pages/CreateRequestForUserPage";
import useUser from "./hooks/useUser"; // Import the useUser hook
import BorrowedCopiesReportPage from "./pages/BorrowedCopiesReportPage";
import AllRequestsPage from "./pages/AllRequestsPage";
import { MoreInfoPage } from "./components/MoreInfoPage"; // Import the MoreInfoPage
import SelectUserPage from "./pages/SelectUserPage";
import SelectBookPage from "./pages/SelectBookPage";

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
      <div className="relative pt-20 z-10 h-screen bg-gradient-to-br from-bg-background-gradient-from via-bg-background-gradient-via to-bg-background-gradient-to overflow-x-hidden">
        <Routes>
          <Route path="/" element={<BooksPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/searchbook" element={<BooksPage />} />
          <Route path="/presentbooks" element={<PresentBooksPage />} />
          <Route path="/addOrUpdatebook" element={<AddOrUpdateBookPage />} />
          <Route path="/addOrUpdatebook/:bookId?" element={<AddOrUpdateBookPage />} />
          <Route path="/WaitingList" element={<WaitingListPage />} />
          <Route path="/BorrowedCopiesReport" element={<BorrowedCopiesReportPage />} />
          <Route path="/user-requests" element={<UserRequestsPage />} />
          <Route path="/AllUsers" element={<AllUsersPage />} />
          <Route path="/AllBooks" element={<AllBooksPage />} />
          <Route path="/CreateRequestForUser" element={<CreateRequestForUserPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/Permissions" element={<PermissionsPage />} />
          <Route path="/contactus" element={<ContactPage />} />
          <Route path="/BorrowedCopies" element={<BorrowedCopiesPage />} />
          <Route path="/all-requests" element={<AllRequestsPage />} />
          <Route path="/BookBorrowDetails/:bookId?" element={<BookBorrowDetailsPage />} />
          <Route path="/book/:bookName" element={<BookDetailPage />} />
          <Route path="/resetpassword" element={<ResetPasswordPage />} />
          <Route path="/more-info" element={<MoreInfoPage />} /> {}
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/SelectUser" element={<SelectUserPage />} /> 
          <Route path="/SelectBook" element={<SelectBookPage />} /> 
          <Route path="/SelectUser/:uid" element={<SelectUserPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
