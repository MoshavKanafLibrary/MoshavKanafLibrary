import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import useUser from "../hooks/useUser";
import DropDown from "./DropDown";
import NavHeaders from "./NavHeaders";
import axios from "axios";
import UserContext from "../contexts/UserContext";
import { GiBookmarklet } from "react-icons/gi";
import AdminSidebar from "./AdminSidebar";
import { FaBell, FaBars, FaTimes, FaUserShield } from "react-icons/fa";

const NavBar = () => {
  const { navBarDisplayName } = useContext(UserContext);
  const { user } = useUser();
  const [userDetails, setUserDetails] = useState({ displayName: "" });
  const [showAdminSidebar, setShowAdminSidebar] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [navOpen, setNavOpen] = useState(false); // For toggling nav links

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const response = await axios.get(`/api/users/${user.uid}`);
        setUserDetails(response.data);
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      try {
        const response = await axios.get(`/api/users/${user.uid}/notifications`);
        if (response.data.success) {
          setNotifications(response.data.notifications);
          const unread = response.data.notifications.filter(notif => !notif.isRead).length;
          setUnreadCount(unread);
        } else {
          console.error("Failed to fetch notifications");
        }
      } catch (error) {
        console.error("Error fetching notifications", error);
      }
    };
    fetchNotifications();
  }, [user]);

  const isAdmin = user && user.isManager; // Check if the user is an admin

  const toggleAdminSidebar = () => {
    setShowAdminSidebar(!showAdminSidebar);
  };

  const toggleNotifications = async () => {
    if (!showNotifications) {
      // Mark all notifications as read when opening the dropdown
      try {
        await axios.put(`/api/users/${user.uid}/notifications/markAsRead`);
        const updatedNotifications = notifications.map(notification => ({
          ...notification,
          isRead: true,
        }));
        setNotifications(updatedNotifications);
        setUnreadCount(0); // Reset unread count
      } catch (error) {
        console.error("Failed to mark notifications as read", error);
      }
    }
    setShowNotifications(!showNotifications);
  };

  const toggleNav = () => {
    setNavOpen(!navOpen);
  };

  const registeredUserNavLinks = [
    { name: "צור קשר", path: "/contactus" },
    { name: "צור בקשת ספר", path: "/user-requests" } // Add the link here
  ].filter(Boolean); // Filter out undefined values

  const unRegisteredUserNavLinks = [
    { name: "מידע", path: "/contactus" },
    { name: "התחברות", path: "/login" },
    { name: "הרשמה", path: "/signup" }
  ];

  const registeredDropDownLinks = [
    { name: "הפרופיל שלי", path: "/profile" },
    { name: "מידע בסיסי", path: "/contactus" }
  ];

  const unRegisteredDropDownLinks = [];

  return (
    <>
      <nav className="fixed top-0 w-full bg-gray-700 transition-colors z-10">
        <div className="flex justify-between items-center sm:px-4 py-3 md:px-10 md:py-5">
          <div className="flex items-center">
            <Link
              to="/"
              className="text-white hover:animate-pulse hover:bg-gray-700 sm:px-3 rounded-md text-sm font-medium"
            >
              <GiBookmarklet size={48} className="text-white" />
            </Link>

            <div className="flex flex-col ml-4">
              <div className="flex flex-row items-center">
                <h1 className="text-gray-200 text-sm md:text-2xl font-medium">
                  <Link to="/">מושב כנף</Link>
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center lg:hidden">
            <button
              onClick={toggleNav}
              className="text-gray-200 focus:outline-none"
            >
              {navOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          <div className={`lg:flex lg:items-center ${navOpen ? "block" : "hidden"}`}>
            {user ? (
              <NavHeaders navBarLinks={registeredUserNavLinks} />
            ) : (
              <NavHeaders navBarLinks={unRegisteredUserNavLinks} />
            )}

            {user && (
              <div className="relative ml-4">
                <div className="relative">
                  <FaBell
                    size={24}
                    className="text-white cursor-pointer"
                    onClick={toggleNotifications}
                  />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-block w-4 h-4 bg-red-600 text-white text-xs font-bold rounded-full text-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-64 max-h-80 bg-white border border-gray-300 rounded-lg shadow-lg overflow-y-auto z-20">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-gray-700">אין התראות</div>
                    ) : (
                      notifications.slice().reverse().map((notification, index) => (
                        <div
                          key={index}
                          className={`p-4 text-gray-700 border-b border-gray-200 ${notification.isRead ? '' : 'bg-red-100'}`}
                        >
                          {notification.message}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {user ? (
              <DropDown
                dropDownLinks={registeredDropDownLinks}
                navBarLinks={registeredUserNavLinks}
                user={user}
                userDetails={userDetails}
                userDisplayName={navBarDisplayName}
              />
            ) : (
              <DropDown
                dropDownLinks={unRegisteredDropDownLinks}
                navBarLinks={unRegisteredUserNavLinks}
                user={user}
              />
            )}

            {/* Use the Admin Icon for both mobile and desktop if the user is an admin */}
            {isAdmin && (
              <button
                onClick={toggleAdminSidebar}
                className="text-gray-200 hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                <FaUserShield size={24} />
              </button>
            )}
          </div>
        </div>
      </nav>
      {showAdminSidebar && <AdminSidebar isVisible={showAdminSidebar} toggleSidebar={toggleAdminSidebar} />}
    </>
  );
};

export default NavBar;
