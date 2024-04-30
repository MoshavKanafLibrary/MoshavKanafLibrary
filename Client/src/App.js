import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import NotFoundPage from "./pages/NotFoundPage";
import Navbar from "./components/Navbar"; // Import the Navbar component
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import BooksPage from "./pages/BooksPage";
import AddOrUpdateBookPage from "./pages/AddOrUpdateBookPage";
import ProfilePage from "./pages/ProfilePage";
import ContactPage from "./pages/ContactPage";
import ManagerPage from "./pages/ManagerPage";
import BookDetailPage from "./pages/BookDetailPage"

function App() {
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
          <Route path="/addOrUpdatebook" element={<AddOrUpdateBookPage />} />
          <Route path="/addOrUpdatebook/:bookId?" element={<AddOrUpdateBookPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/contactus" element={<ContactPage />} />
          <Route path="/manager" element={<ManagerPage />} />
          <Route path="/book/:bookName" element={<BookDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
