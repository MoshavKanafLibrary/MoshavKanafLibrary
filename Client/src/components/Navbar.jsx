import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import useUser from "../hooks/useUser";
import DropDown from "./DropDown";
import NavHeaders from "./NavHeaders";
import axios from "axios";
import UserContext from "../contexts/UserContext";
import { GiBookmarklet } from "react-icons/gi";
import AdminSidebar from "./AdminSidebar";
import { FaBell, FaUserShield } from "react-icons/fa";

// NavBar component for managing navigation and user interactions.
// Displays different links and options for registered and unregistered users.
// Includes notifications, a dropdown for user profile actions, and an admin sidebar for users with manager privileges.
// The component fetches user details and notifications from the server and handles marking notifications as read.


const NavBar = () => {
  const { navBarDisplayName } = useContext(UserContext);
  const { user } = useUser();
  const [userDetails, setUserDetails] = useState({ lastName: "" });
  const [showAdminSidebar, setShowAdminSidebar] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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
        console.error("Error fetching notifications");
      }
    };
    fetchNotifications();
  }, [user]);

  const isAdmin = user && user.isManager;

  const toggleAdminSidebar = () => {
    setShowAdminSidebar(!showAdminSidebar);
  };

  const toggleNotifications = async () => {
    if (!showNotifications) {
      try {
        await axios.put(`/api/users/${user.uid}/notifications/markAsRead`);
        const updatedNotifications = notifications.map(notification => ({
          ...notification,
          isRead: true,
        }));
        setNotifications(updatedNotifications);
        setUnreadCount(0);
      } catch (error) {
        console.error("Failed to mark notifications as read", error);
      }
    }
    setShowNotifications(!showNotifications);
  };

  const registeredUserNavLinks = [
    { name: "צור קשר", path: "/contactus" },
    { name: "צור בקשת ספר", path: "/user-requests" },
    { name: "עדכון פרטים", path: "/more-info" },
  ].filter(Boolean);

  const unRegisteredUserNavLinks = [
    { name: "צור קשר", path: "/contactus" },
    { name: "הרשמה", path: "/signup" },
  ];

  const registeredDropDownLinks = [{ name: "הפרופיל שלי", path: "/profile" }];

  const unRegisteredDropDownLinks = [];

  return (
    <>
      <nav className="fixed top-0 w-full bg-bg-navbar-custom transition-colors z-10">
        <div className="flex justify-between items-center sm:px-4 py-3 md:px-10 md:py-5">
          <div className="flex items-center">
            <Link
              to="/"
              className="text-bg-text hover:animate-pulse hover:bg-bg-navbar-custom sm:px-3 rounded-md text-sm font-medium"
            >
              <GiBookmarklet size={48} className="text-bg-text" />
            </Link>

            <div className="flex flex-col ml-4">
              <div className="flex flex-row items-center">
                <h1 className="text-bg-text text-sm md:text-2xl font-medium">
                  <Link to="/">מושב כנף</Link>
                </h1>
              </div>
            </div>
          </div>

          <div className={`lg:flex lg:items-center`}>
            {user ? (
              <NavHeaders
                navBarLinks={registeredUserNavLinks.map((link) => ({
                  ...link,
                  color: "bg-background-gradient-from",
                }))}
              />
            ) : (
              <NavHeaders
                navBarLinks={unRegisteredUserNavLinks.map((link) => ({
                  ...link,
                  color: "bg-background-gradient-from",
                }))}
              />
            )}

            <div className="flex items-center space-x-4 ml-4 relative">
              {user && (
                <div className="relative">
                  <FaBell
                    size={24}
                    className="text-bg-text cursor-pointer"
                    onClick={toggleNotifications}
                  />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-block w-4 h-4 bg-red-600 text-white text-xs font-bold rounded-full text-center">
                      {unreadCount}
                    </span>
                  )}
                  {showNotifications && (
                    <div
                      className="absolute right-0 mt-2 w-64 max-h-80 bg-white border border-gray-300 rounded-lg shadow-lg overflow-y-auto z-20"
                      style={{
                        right: 'auto',
                        left: 0,
                        transform: 'translateX(-50%)',
                        maxWidth: 'calc(100vw - 20px)',
                      }}
                    >
                      {notifications.length === 0 ? (
                        <div className="p-4 text-gray-700">אין התראות</div>
                      ) : (
                        notifications
                          .slice()
                          .reverse()
                          .map((notification, index) => (
                            <div
                              key={index}
                              className={`p-4 text-gray-700 border-b border-gray-200 ${
                                notification.isRead ? "" : "bg-red-100"
                              }`}
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
                <div className="relative">
                  <DropDown
                    dropDownLinks={registeredDropDownLinks}
                    navBarLinks={registeredUserNavLinks}
                    user={user}
                    userDetails={userDetails}
                    userDisplayName={userDetails.lastName}
                  />
                </div>
              ) : (
                <div className="relative">
                  <DropDown
                    dropDownLinks={unRegisteredDropDownLinks}
                    navBarLinks={unRegisteredUserNavLinks}
                    user={user}
                  />
                </div>
              )}

              {isAdmin && (
                <button
                  onClick={toggleAdminSidebar}
                  className="text-bg-text hover:bg-bg-navbar-custom px-3 py-2 rounded-md text-sm font-medium"
                >
                  <FaUserShield size={24} />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      {showAdminSidebar && (
        <AdminSidebar
          isVisible={showAdminSidebar}
          toggleSidebar={toggleAdminSidebar}
        />
      )}
    </>
  );
};

export default NavBar;
