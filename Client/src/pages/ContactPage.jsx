import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// התאמה אישית של האייקון של המרקר
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ContactPage = () => {
  const position = [32.870865, 35.697842]; // הקואורדינטות של מושב כנף

  return (
    <div className="relative pt-20 z-10 min-h-screen overflow-x-hidden" dir="rtl">
      <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-bg-navbar-custom text-center mb-10">
        ספריית כנף
      </h1>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-bg-navbar-custom p-10 rounded-lg shadow-xl text-center space-y-12">
          <div className="bg-bg-hover p-8 rounded-md shadow-inner text-white">
            <h3 className="text-3xl font-bold mb-4">שעות פתיחה</h3>
            <p className="text-xl">ימי שלישי, 18:00 - 17:00</p>
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

          {/* מפה אינטראקטיבית עם Leaflet */}
          <div className="mb-8" style={{ height: '400px', width: '100%' }}>
            <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={position}>
                <Popup>ספריית מושב כנף</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
