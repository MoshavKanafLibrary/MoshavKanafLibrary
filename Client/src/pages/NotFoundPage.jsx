import React from "react";
import { Link } from "react-router-dom";
import NotFoundPageImage from '../assets/NotFoundPageImage.png'

const NotFoundPage = () => {
  return (
    <div className="h-screen w-screen bg-gray-50 flex items-center" dir="rtl">
      <div className="container flex flex-col md:flex-row items-center justify-between px-5 text-gray-700">
        <div className="w-full lg:w-1/2 mx-8">
          <div className="text-7xl text-blue-500 font-dark font-extrabold mb-8">
            404
          </div>
          <p className="text-2xl md:text-3xl font-light leading-normal mb-8">
            סליחה, לא מצאנו את הדף שאתה מחפש
          </p>

          <Link
            to={"/login"}
            className="px-5 inline py-3 text-sm font-medium leading-5 shadow-2xl text-white transition-all duration-400 border border-transparent rounded-lg focus:outline-none bg-blue-600 active:bg-blue-800 hover:bg-blue-700"
          >
            חזור לדף הבית
          </Link>
        </div>
        <div className="w-full lg:flex lg:justify-end lg:w-1/2 mx-5 my-12">
          <img
            src={NotFoundPageImage}
            alt="Page not found"
            className=""
          />
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
