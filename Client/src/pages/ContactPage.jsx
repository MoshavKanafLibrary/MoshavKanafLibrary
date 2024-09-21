import React from 'react';

/*
 * ContactPage component displays information about the library, including opening hours, contact details, and location.
 * It presents the content in a structured, responsive layout with sections for opening hours, contact information, and location.
 * The page includes an embedded static Google Map image for the library location.
 */


const ContactPage = () => {
  return (
    <div className="relative pt-10 z-10 min-h-screen overflow-x-hidden" dir="rtl">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-bg-navbar-custom text-center mb-8">
        ספריית כנף
      </h1>
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="bg-bg-navbar-custom p-6 sm:p-8 md:p-10 rounded-lg shadow-xl text-center space-y-8">
          <div className="bg-bg-hover p-6 sm:p-8 rounded-md shadow-inner text-white">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">שעות פתיחה</h3>
            <p className="text-lg sm:text-xl">
              ימי שלישי, 18:00 - 17:00
            </p>
          </div>

          <div className="bg-bg-hover p-6 sm:p-8 rounded-md shadow-inner text-white">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">צור קשר</h3>
            <p className="text-lg sm:text-xl mb-4 sm:mb-6">למידע על שירותי הספריה ניתן ליצור קשר בפלאפון:</p>
            <div className="text-xl sm:text-2xl">
              <strong>שחר:</strong> 050-742-8938
            </div>
          </div>

          <div className="bg-bg-hover p-6 sm:p-8 rounded-md shadow-inner text-white">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">מיקום</h3>
            <p className="text-lg sm:text-xl">מועדון חברים, מושב כנף</p>
            <p className="text-lg sm:text-xl">חנייה רחבה ונגישות לנכים</p>
          </div>

          <div className="mb-6 sm:mb-8">
           <img
            src="/library.png"
            alt="מפת מושב כנף"
            className="mx-auto"
            style={{ width: 'auto', height: 'auto', maxWidth: '100%' }}
          />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
