import React, { useContext } from 'react';
import UserContext from '../contexts/UserContext'; // Importing the UserContext

const borrowedBooks = [
  {
    title: 'The Catcher in the Rye',
    borrowedDate: '2024-03-01',
    dueDate: '2024-04-01', // expired
    status: 'accepted',
  },
  {
    title: '1984',
    borrowedDate: '2024-03-10',
    dueDate: '2024-05-10', // not expired
    status: 'accepted',
  },
  {
    title: 'To Kill a Mockingbird',
    borrowedDate: '2024-03-15',
    dueDate: '2024-04-15', // pending
    status: 'pending', // waiting for librarian
  },
];

const ProfilePage = () => {
  return (
<div className="relative pt-20 z-10 h-screen bg-gradient-to-br from-gray-300 via-gray-200 to-gray-100 overflow-x-hidden">

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-black text-center">Profile</h1>
        
        <div className="container mx-auto px-4 py-8">
          <div className="bg-gray-700 p-6 rounded-lg shadow-lg text-center">            
            <h3 className="mt-6 text-2xl text-white">Borrowed Books</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {borrowedBooks.map((book, index) => {
                const isExpired = new Date(book.dueDate) < new Date();
                const dateColor = book.status === 'pending'
                  ? 'bg-yellow-500'
                  : isExpired
                    ? 'bg-red-500'
                    : 'bg-green-500';

                return (
                  <div
                    key={index}
                    className="bg-gray-600 p-4 rounded-lg shadow-lg flex flex-col items-center"
                  >
                    <h4 className="text-xl text-white">{book.title}</h4>
                    <p className={`text-md ${dateColor} text-white py-2 px-4 rounded-full`}>
                      Due Date: {book.dueDate}
                    </p>
                    <p className="text-gray-300">Status: {book.status === 'pending' ? 'Pending' : 'Accepted'}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
    </div>
  );
};

export default ProfilePage;
