import React from 'react';

const ContactPage = () => {
  return (
    <div className="relative pt-20 z-10 h-screen bg-gradient-to-br from-[#4B0000] via-[#8B0000] to-[#4B0000] overflow-x-hidden" dir="rtl">
      <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-[#E7DBCB] text-center">צור קשר</h1>
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-[#E7DBCB] p-8 rounded-lg shadow-lg text-center space-y-6">
          <h2 className="text-3xl text-[#7C382A] font-bold">ספריית מושב כנף</h2>
          
          <p className="text-xl text-[#7C382A]">לשאלות כלליות, אנא צרו קשר עם:</p>
          
          <div className="flex flex-col items-center space-y-4">
            <div className="text-[#7C382A]">
              <strong>יובל זוהר:</strong> 0523482383
            </div>
            
            <div className="text-[#7C382A]">
              <strong>עמית פרץ:</strong> 0523842834
            </div>
          </div>

          <h3 className="text-2xl text-[#7C382A] font-bold">שעות פתיחה</h3>
          <p className="text-[#7C382A] text-lg">
            יום שני עד חמישי, 9:00 בבוקר עד 6:00 בערב
          </p>
          <p className="text-[#7C382A] text-lg">
            אירועי קהילה כל שבת ב-10:00 בבוקר
          </p>

          <h3 className="text-2xl text-[#7C382A] font-bold">מיקום</h3>
          <p className="text-[#7C382A] text-lg">
            רחוב הספרייה 123, מושב כנף
          </p>
          <p className="text-[#7C382A] text-lg">
            חנייה רחבה ונגישות לנכים
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
