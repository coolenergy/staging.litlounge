const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        "3xl": "1800px",
      },
      spacing: {
        0.25: "0.0625rem", // 1px
        0.75: "0.1875rem", // 3px
        1.25: "0.3125rem", // 5px
        1.75: "0.4375rem", // 7px
        2.25: "0.5625rem", // 9px
        2.75: "0.6875rem", // 11px
        18: "4.5rem", // 72px
        38: "9.5rem", // 152px
      },
      colors: {
        my: {
          background: "#18001c",
          light: "#f4f4f4",
          dark: "#323232",
          purple: "#9100ef",
          pink: "#b418ca",
        },
      },
      fontFamily: {
        sans: ["Poppins", ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        9: ["0.5625rem", "0.875rem"], // ["9px", "14px"]
        12: ["0.75rem", "1.125rem"], // ["12px", "18px"]
        13: ["0.8125rem", "1.25rem"], // ["13px", "20px"]
        14: ["0.875rem", "1.3125rem"], // ["14px", "21px"]
        15: ["0.9375rem", "1.375rem"], // ["15px", "22px"]
        16: ["1rem", "1.5rem"], // ["16px", "24px"]
        17: ["1.0625rem", "1.59375rem"], // ["17px", "25.5px"]
        19: ["1.1875rem", "1.75rem"], // ["19px", "28px"]
        20: ["1.25rem", "1.875rem"], // ["20px", "30px"]
        21: ["1.3125rem", "2rem"], // ["21px", "32px"]
        22: ["1.375rem", "2.0625rem"], // ["22px", "33px"]
        23: ["1.4375rem", "2.125rem"], // ["23px", "34px"]
        29: ["1.8125rem", "2.75rem"], // ["29px", "44px"]
        31: ["1.9375rem", "2.875rem"], // ["31px", "46px"]
        32: ["2rem", "3rem"], // ["32px", "48px"]
        33: ["2.0625rem", "3.125rem"], // ["33px", "50px"]
        37: ["2.3125rem", "3.5rem"], // ["37px", "56px"]
        39: ["2.4375rem", "3.625rem"], // ["39px", "58px"]
      },
      borderWidth: {
        3: "3px",
      },
      borderRadius: {
        1: "0.0625rem", // 1px
        2: "0.125rem", // 2px
        3: "0.1875rem", // 3px
        4: "0.25rem", // 4px
        6: "0.375rem", // 6px
        8: "0.5rem", // 8px
        9: "0.5625rem", // 9px
        10: "0.625rem", // 10px
        12: "0.75rem", // 12px
        13: "0.8125rem", // 13px
        15: "0.9375rem", // 15px
        16: "1rem", // 16px
        20: "1.25rem", // 20px
        24: "1.5rem", // 24px
        40: "2.5rem", // 40px
      },
      opacity: {
        15: 0.15,
      },
    },
  },
  plugins: [],
};
