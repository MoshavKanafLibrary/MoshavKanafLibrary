import React from 'react';

const ContactPage = () => {
  return (
    <div className="relative pt-20 z-10 h-screen bg-gradient-to-br from-gray-300 via-gray-200 to-gray-100 overflow-x-hidden" dir="rtl">
      <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-black text-center">צור קשר</h1>
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-700 p-8 rounded-lg shadow-lg text-center space-y-6">
          <h2 className="text-3xl text-white font-bold">ספריית מושב כנף</h2>
          
          <p className="text-xl text-white">לשאלות כלליות, אנא צרו קשר עם:</p>
          
          <div className="flex flex-col items-center space-y-4">
            <div className="text-white">
              <strong>יובל זוהר:</strong> 0523482383
            </div>
            
            <div className="text-white">
              <strong>עמית פרץ:</strong> 0523842834
            </div>
          </div>

          <h3 className="text-2xl text-white font-bold">שעות פתיחה</h3>
          <p className="text-white text-lg">
            יום שני עד חמישי, 9:00 בבוקר עד 6:00 בערב
          </p>
          <p className="text-white text-lg">
            אירועי קהילה כל שבת ב-10:00 בבוקר
          </p>

          <h3 className="text-2xl text-white font-bold">מיקום</h3>
          <p className="text-white text-lg">
            רחוב הספרייה 123, מושב כנף
          </p>
          <p className="text-white text-lg">
            חנייה רחבה ונגישות לנכים
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
