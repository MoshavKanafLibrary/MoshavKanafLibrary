export default {
  mode: "jit",
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        "bg-main-custom": "#18181b",
        "bg-navbar-custom": "#161b21",
        "bg-login-custom": "#E0E7FF",
        "bg-navbar-gradient-from": "#18181b",
        "bg-navbar-gradient-to": "#000000",
        "bg-home-gradient-from": "#D3CCE3  ",
        "bg-home-gradient-to": "#E9E4F0",
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