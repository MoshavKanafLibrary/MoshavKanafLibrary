import React from 'react';

const ContactPage = () => {
  return (
    <div className="relative pt-20 z-10 h-screen overflow-x-hidden" dir="rtl">
      <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-bg-navbar-custom text-center">צור קשר</h1>
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-bg-navbar-custom p-8 rounded-lg shadow-lg text-center space-y-6">
          <h2 className="text-3xl text-bg-text font-bold">ספריית מושב כנף</h2>
          
          <p className="text-xl text-bg-text">לשאלות כלליות, אנא צרו קשר עם:</p>
          
          <div className="flex flex-col items-center space-y-4">
            <div className="text-bg-text">
              <strong>יובל זוהר:</strong> 0523482383
            </div>
            
            <div className="text-bg-text">
              <strong>עמית פרץ:</strong> 0523842834
            </div>
          </div>

          <h3 className="text-2xl text-bg-text font-bold">שעות פתיחה</h3>
          <p className="text-bg-text text-lg">
            יום שני עד חמישי, 9:00 בבוקר עד 6:00 בערב
          </p>
          <p className="text-bg-text text-lg">
            אירועי קהילה כל שבת ב-10:00 בבוקר
          </p>

          <h3 className="text-2xl text-bg-text font-bold">מיקום</h3>
          <p className="text-bg-text text-lg">
            רחוב הספרייה 123, מושב כנף
          </p>
          <p className="text-bg-text text-lg">
            חנייה רחבה ונגישות לנכים
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
