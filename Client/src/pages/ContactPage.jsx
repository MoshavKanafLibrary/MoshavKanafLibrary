import React from 'react';

const ContactPage = () => {
  return (
    <div className="relative pt-20 z-10 min-h-screen overflow-x-hidden" dir="rtl">
      <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-bg-navbar-custom text-center mb-10">
        ספריית כנף
      </h1>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-bg-navbar-custom p-10 rounded-lg shadow-xl text-center space-y-12">
          <div className="bg-bg-hover p-8 rounded-md shadow-inner text-white">
            <h3 className="text-3xl font-bold mb-4">שעות פתיחה</h3>
            <p className="text-xl">
              ימי שלישי, 18:00 - 17:00
            </p>
          </div>

          <div className="bg-bg-hover p-8 rounded-md shadow-inner text-white">
            <h3 className="text-3xl font-bold mb-4">צור קשר</h3>
            <p className="text-xl mb-6">למידע על שירותי הספריה ניתן ליצור קשר בפלאפון:</p>
            <div className="text-2xl">
              <strong>שחר:</strong> 050-742-8938
            </div>
          </div>

          <div className="bg-bg-hover p-8 rounded-md shadow-inner text-white">
            <h3 className="text-3xl font-bold mb-4">מיקום</h3>
            <p className="text-xl">מועדון חברים, מושב כנף</p>
            <p className="text-xl">חנייה רחבה ונגישות לנכים</p>
          </div>
          <div className="mb-8">
           <img
  src="https://maps.googleapis.com/maps/api/staticmap?key=AIzaSyDvJPUjwB_z9I6MAuVQ2ISnKaWK59M0IqA&center=32.870865,35.697842&markers=color:red%7C32.870865,35.697842&zoom=13&scale=1&size=760x315&language=he"
  alt="מפת מושב כנף"
  className="w-full h-auto rounded-lg"
/>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
