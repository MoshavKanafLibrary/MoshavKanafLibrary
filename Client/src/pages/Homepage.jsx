import React from "react";

const Homepage = () => {
  return (
    <div className="h-full bg-bg-main-custom bg-fixed">
      <div className="text-center">
        <div className="bg-gradient-to-r from-bg-navbar-gradient-from to-bg-navbar-gradient-to pt-10 md:pt-32 pb-8">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-8">
            Trading Tournament
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white mb-8 mx-4">
            Outsmart your rivals and showcase your trading skills in Trading
            Tournament!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
