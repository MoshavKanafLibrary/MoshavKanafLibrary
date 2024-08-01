export default {
  mode: "jit",
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"], // Updated from 'purge'
  darkMode: 'media', // Updated to 'media' or you can remove it if not needed
  theme: {
    extend: {
      colors: {
        "bg-header-custom":"#DDE1EC",
        "bg-navbar-custom": "#DDE1EC",
        "bg-background-gradient-from": "#34389C",
        "bg-background-gradient-via": "#1D1D40",
        "bg-background-gradient-to": "#34389C",
        "bg-background-textbox":"#2B2D57",
        "bg-text":"#19162A",
        "bg-hover":"#535692"
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
