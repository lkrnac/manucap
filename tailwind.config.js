const themeColors = {
    blue: {
        100: "#d9e9ff",
        200: "#b8d7ff",
        300: "#99c5ff",
        400: "#79b2fc",
        500: "#589ffc",
        600: "#3e8ef7",
        700: "#247cf0",
        800: "#0b69e3",
        900: "#0053bf"
    },
    grey: {
        100: "#fafafa",
        200: "#eeeeee",
        300: "#e0e0e0",
        400: "#bdbdbd",
        500: "#9e9e9e",
        600: "#757575",
        700: "#616161",
        800: "#424242"
    },
    "blue-grey": {
        100: "#f3f7f9",
        200: "#e4eaec",
        300: "#ccd5db",
        400: "#a3afb7",
        500: "#76838f",
        600: "#526069",
        700: "#37474f",
        800: "#263238"
    }
}

const colorStates = {
    warning: "#faa700",
    danger: "#ff4c52",
    success: "#008c4d",
    info: "#0b69e3"
}

module.exports = {
    prefix: "tw-",
    content: [
        "./src/**/*.{js,jsx,ts,tsx,html}"
    ],
    theme: {
        extend: {
            textColor: { ...themeColors, ...colorStates },
            backgroundColor: { ...themeColors, ...colorStates, body: "#f1f4f5" },
            borderColor: themeColors,
            divide: themeColors,
            zIndex: {
                "100": "100",
                "200": "200"
            }
        },
        fontFamily: {
            sans: ["Roboto", "sans-serif"]
        },
    },
    variants: {}
}
