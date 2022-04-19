const themeColors = {
    red: {
        100: "rgba(var(--red-100), var(--tw-bg-opacity))",
        200: "rgba(var(--red-200), var(--tw-bg-opacity))",
        300: "rgba(var(--red-300), var(--tw-bg-opacity))",
        400: "rgba(var(--red-400), var(--tw-bg-opacity))",
        500: "rgba(var(--red-500), var(--tw-bg-opacity))",
        600: "rgba(var(--red-600), var(--tw-bg-opacity))",
        700: "rgba(var(--red-700), var(--tw-bg-opacity))",
        800: "rgba(var(--red-800), var(--tw-bg-opacity))",
        900: "rgba(var(--red-900), var(--tw-bg-opacity))",
    },
    blue: {
        100: "rgba(var(--blue-100), var(--tw-bg-opacity))",
        200: "rgba(var(--blue-200), var(--tw-bg-opacity))",
        300: "rgba(var(--blue-300), var(--tw-bg-opacity))",
        400: "rgba(var(--blue-400), var(--tw-bg-opacity))",
        500: "rgba(var(--blue-500), var(--tw-bg-opacity))",
        600: "rgba(var(--blue-600), var(--tw-bg-opacity))",
        700: "rgba(var(--blue-700), var(--tw-bg-opacity))",
        800: "rgba(var(--blue-800), var(--tw-bg-opacity))",
        900: "rgba(var(--blue-900), var(--tw-bg-opacity))",
    },
    green: {
        100: "rgba(var(--green-100), var(--tw-bg-opacity))",
        200: "rgba(var(--green-200), var(--tw-bg-opacity))",
        300: "rgba(var(--green-300), var(--tw-bg-opacity))",
        400: "rgba(var(--green-400), var(--tw-bg-opacity))",
        500: "rgba(var(--green-500), var(--tw-bg-opacity))",
        600: "rgba(var(--green-600), var(--tw-bg-opacity))",
        700: "rgba(var(--green-700), var(--tw-bg-opacity))",
        800: "rgba(var(--green-800), var(--tw-bg-opacity))",
        900: "rgba(var(--green-900), var(--tw-bg-opacity))",
    },
    yellow: {
        100: "rgba(var(--yellow-100), var(--tw-bg-opacity))",
        200: "rgba(var(--yellow-200), var(--tw-bg-opacity))",
        300: "rgba(var(--yellow-300), var(--tw-bg-opacity))",
        400: "rgba(var(--yellow-400), var(--tw-bg-opacity))",
        500: "rgba(var(--yellow-500), var(--tw-bg-opacity))",
        600: "rgba(var(--yellow-600), var(--tw-bg-opacity))",
        700: "rgba(var(--yellow-700), var(--tw-bg-opacity))",
        800: "rgba(var(--yellow-800), var(--tw-bg-opacity))",
        900: "rgba(var(--yellow-900), var(--tw-bg-opacity))",
    },
    teal: {
        100: "rgba(var(--teal-100), var(--tw-bg-opacity))",
        200: "rgba(var(--teal-200), var(--tw-bg-opacity))",
        300: "rgba(var(--teal-300), var(--tw-bg-opacity))",
        400: "rgba(var(--teal-400), var(--tw-bg-opacity))",
        500: "rgba(var(--teal-500), var(--tw-bg-opacity))",
        600: "rgba(var(--teal-600), var(--tw-bg-opacity))",
        700: "rgba(var(--teal-700), var(--tw-bg-opacity))",
        800: "rgba(var(--teal-800), var(--tw-bg-opacity))",
        900: "rgba(var(--teal-900), var(--tw-bg-opacity))",
    },
    grey: {
        100: "rgba(var(--grey-100), var(--tw-bg-opacity))",
        200: "rgba(var(--grey-200), var(--tw-bg-opacity))",
        300: "rgba(var(--grey-300), var(--tw-bg-opacity))",
        400: "rgba(var(--grey-400), var(--tw-bg-opacity))",
        500: "rgba(var(--grey-500), var(--tw-bg-opacity))",
        600: "rgba(var(--grey-600), var(--tw-bg-opacity))",
        700: "rgba(var(--grey-700), var(--tw-bg-opacity))",
        800: "rgba(var(--grey-800), var(--tw-bg-opacity))",
    },
    "blue-grey": {
        100: "rgba(var(--blue-grey-100), var(--tw-bg-opacity))",
        200: "rgba(var(--blue-grey-200), var(--tw-bg-opacity))",
        300: "rgba(var(--blue-grey-300), var(--tw-bg-opacity))",
        400: "rgba(var(--blue-grey-400), var(--tw-bg-opacity))",
        500: "rgba(var(--blue-grey-500), var(--tw-bg-opacity))",
        600: "rgba(var(--blue-grey-600), var(--tw-bg-opacity))",
        700: "rgba(var(--blue-grey-700), var(--tw-bg-opacity))",
        800: "rgba(var(--blue-grey-800), var(--tw-bg-opacity))",
    },
    "dotsub-blue": {
        "light": "rgba(var(--dotsub-blue-light), var(--tw-bg-opacity))",
        "lighter": "rgba(var(--dotsub-blue-lighter), var(--tw-bg-opacity))",
        "highlight": "rgba(var(--dotsub-blue-highlight), var(--tw-bg-opacity))",
        "main": "rgba(var(--dotsub-blue-main), var(--tw-bg-opacity))",
    },
    "dotsub-green": {
        "main": "rgba(var(--dotsub-green-main), var(--tw-bg-opacity))",
        "light": "rgba(var(--dotsub-green-light), var(--tw-bg-opacity))",
        "lighter": "rgba(var(--dotsub-green-ligther), var(--tw-bg-opacity))",
    }
}

const colorStates = {
    "warning": "rgba(var(--warning), var(--tw-bg-opacity))",
    "danger": "rgba(var(--danger), var(--tw-bg-opacity))",
    "success": "rgba(var(--success), var(--tw-bg-opacity))",
    "info": "rgba(var(--info), var(--tw-bg-opacity))"
}

const bodyBackground = "var(--body-background)";
const footerBackground = "var(--footer-background)";

module.exports = {
    prefix: "tw-",
    content: [
        "./src/**/*.{js,jsx,ts,tsx,html}"
    ],
    theme: {
        extend: {
            textColor: { ...themeColors, ...colorStates },
            backgroundColor: { ...themeColors, ...colorStates, body: bodyBackground, footer: footerBackground },
            borderColor: { ...themeColors, ...colorStates },
            divide: themeColors,
            zIndex: {
                "100": "100",
                "200": "200"
            }
        },
        fontFamily: {
            sans: ["Roboto", "sans-serif"],
            mono: ["SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"]
        },
    },
    variants: {}
}
