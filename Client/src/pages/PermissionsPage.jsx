import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';

const PermissionsPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    axios.get("/api/users")
      .then(response => {
        if (response.data.success && Array.isArray(response.data.users)) {
          setUsers(response.data.users);
          setFilteredUsers(response.data.users);
        } else {
          console.error("Unexpected data format:", response.data);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching users:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = users.filter(user =>
      (user.firstName && user.firstName.toLowerCase().includes(lowerCaseQuery)) ||
      (user.lastName && user.lastName.toLowerCase().includes(lowerCaseQuery)) ||
      (user.uid && user.uid.toLowerCase().includes(lowerCaseQuery)) ||
      (user.email && user.email.toLowerCase().includes(lowerCaseQuery)) ||
      (user.phone && user.phone.toString().includes(searchQuery)) ||
      (user.random && user.random.toString().includes(searchQuery)) ||
      (user.isManager && (user.isManager ? 'כן' : 'לא').includes(lowerCaseQuery))
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const toggleManagerStatus = async (uid, currentStatus) => {
    try {
      const response = await axios.put(`/api/users/${uid}/isManager`, { isManager: !currentStatus });
      if (response.data.success) {
        setUsers(users.map(user =>
          user.uid === uid ? { ...user, isManager: !currentStatus } : user
        ));
        setFilteredUsers(filteredUsers.map(user =>
          user.uid === uid ? { ...user, isManager: !currentStatus } : user
        ));
      } else {
        console.error("Failed to update manager status");
      }
    } catch (error) {
      console.error("Error updating manager status:", error);
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
          <FaSpinner className="animate-spin text-white text-6xl" />
        </div>
      )}
      <div className="container mx-auto px-4 py-8 max-w-7xl mt-10" dir="rtl">
        <h1 className="text-5xl font-extrabold text-center mb-8 tracking-wide text-[#F5EFE6]">כל המשתמשים</h1>
        <input
          type="text"
          className="w-full p-2 mb-4 text-lg"
          placeholder="חפש משתמשים לפי שם, תעודת זהות, אימייל, פלאפון, מזהה רנדומלי, או סטטוס מנהל..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full bg-[#F5EFE6] rounded-lg shadow-lg">
            <thead className="bg-[#7C382A] text-[#F5EFE6] text-lg">
              <tr>
                <th className="py-4 px-6 text-right">תעודת זהות</th>
                <th className="py-4 px-6 text-right">שם פרטי</th>
                <th className="py-4 px-6 text-right">שם משפחה</th>
                <th className="py-4 px-6 text-right">אימייל</th>
                <th className="py-4 px-6 text-right">פלאפון</th>
                <th className="py-4 px-6 text-right">מזהה רנדומלי</th>
                <th className="py-4 px-6 text-right">הרשאות מנהל</th>
                <th className="py-4 px-6 text-right">פעולות</th>
              </tr>
            </thead>
            <tbody className="text-[#7C382A]">
              {currentUsers.length > 0 ? currentUsers.map((user, index) => (
                <tr key={index} className="border-b border-[#7C382A] hover:bg-[#8B0000] hover:text-[#F5EFE6]">
                  <td className="py-4 px-6 text-right">{user.uid}</td>
                  <td className="py-4 px-6 text-right">{user.firstName}</td>
                  <td className="py-4 px-6 text-right">{user.lastName}</td>
                  <td className="py-4 px-6 text-right">{user.email}</td>
                  <td className="py-4 px-6 text-right">{user.phone}</td>
                  <td className="py-4 px-6 text-right">{user.random}</td>
                  <td className="py-4 px-6 text-right">{user.isManager ? 'כן' : 'לא'}</td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => toggleManagerStatus(user.uid, user.isManager)}
                      className={`font-bold py-2 px-4 rounded ${user.isManager ? 'bg-[#4B0000] text-[#F5EFE6]' : 'bg-[#4B0000] text-[#F5EFE6]'}`}
                    >
                      {user.isManager ? 'בטל מנהל' : 'עשה מנהל'}
                    </button>
                  </td>
                </tr>
              )) : <tr><td colSpan="8" className="text-center py-4">לא נמצאו משתמשים</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center mb-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={`mx-1 px-4 py-2 rounded ${currentPage === i + 1 ? 'bg-[#4B0000] hover:bg-[#8B0000] text-[#F5EFE6]' : 'bg-[#F5EFE6] text-[#7C382A]'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default PermissionsPage;
