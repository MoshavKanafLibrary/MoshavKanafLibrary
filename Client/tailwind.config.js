export default {
  mode: "jit",
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"], // Updated from 'purge'
  darkMode: 'media', // Updated to 'media' or you can remove it if not needed
  theme: {
    extend: {
      colors: {
        "bg-main-custom": "#18181b",
        "bg-navbar-custom": "#161b21",
        "bg-login-custom": "#E0E7FF",
        "bg-navbar-gradient-from": "#18181b",
        "bg-navbar-gradient-to": "#000000",
        "bg-home-gradient-from": "#D3CCE3",
        "bg-home-gradient-to": "#E9E4F0",
        "bg-red-black-gradient-from": "#4B0000",
        "bg-red-black-gradient-via": "#8B0000",
        "bg-red-black-gradient-to": "#4B0000",
        "bg-light-custom": "#E7DBCB",
        "bg-dark-red": "#7C382A",
      },
      screens: {
        notComputer: "1500px",
      },
      width: {
        "1/7": "14.2857143%",
      },
    },
  },
  plugins: [],
};
