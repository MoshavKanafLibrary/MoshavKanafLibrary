import React from 'react';

const ContactPage = () => {
  return (
<div className="relative pt-20 z-10 h-screen bg-gradient-to-br from-gray-300 via-gray-200 to-gray-100 overflow-x-hidden">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-black text-center">Contact Us</h1>
        
        <div className="container mx-auto px-4 py-8">
          <div className="bg-gray-700 p-8 rounded-lg shadow-lg text-center space-y-6">
            <h2 className="text-3xl text-white font-bold">Moshav Kanaf Library</h2>
            
            <p className="text-xl text-white">For general inquiries, please contact:</p>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="text-white">
                <strong>Yuval Zohar:</strong> 0523482383
              </div>
              
              <div className="text-white">
                <strong>Amit Perets:</strong> 0523842834
              </div>
            </div>

            <h3 className="text-2xl text-white font-bold">Opening Hours</h3>
            <p className="text-white text-lg">
              Monday to Thursday, 9:00 AM to 6:00 PM
            </p>
            <p className="text-white text-lg">
              Community events every Saturday at 10:00 AM
            </p>

            <h3 className="text-2xl text-white font-bold">Location</h3>
            <p className="text-white text-lg">
              123 Library Lane, Moshav Kanaf
            </p>
            <p className="text-white text-lg">
              Ample parking space and wheelchair accessibility
            </p>
          </div>
        </div>
      </div>
  );
};

export default ContactPage;
