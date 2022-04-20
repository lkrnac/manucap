function withOpacityValue(variable) {
    return ({ opacityValue }) => {
        if (opacityValue === undefined) {
            return `rgb(var(${variable}))`
        }
        return `rgba(var(${variable}), ${opacityValue})`
    }
}

const themeColors = {
    red: {
        100: withOpacityValue("--red-100"),
        200: withOpacityValue("--red-200"),
        300: withOpacityValue("--red-300"),
        400: withOpacityValue("--red-400"),
        500: withOpacityValue("--red-500"),
        600: withOpacityValue("--red-600"),
        700: withOpacityValue("--red-700"),
        800: withOpacityValue("--red-800"),
        900: withOpacityValue("--red-900"),
    },
    blue: {
        100: withOpacityValue("--blue-100"),
        200: withOpacityValue("--blue-200"),
        300: withOpacityValue("--blue-300"),
        400: withOpacityValue("--blue-400"),
        500: withOpacityValue("--blue-500"),
        600: withOpacityValue("--blue-600"),
        700: withOpacityValue("--blue-700"),
        800: withOpacityValue("--blue-800"),
        900: withOpacityValue("--blue-900"),
    },
    green: {
        100: withOpacityValue("--green-100"),
        200: withOpacityValue("--green-200"),
        300: withOpacityValue("--green-300"),
        400: withOpacityValue("--green-400"),
        500: withOpacityValue("--green-500"),
        600: withOpacityValue("--green-600"),
        700: withOpacityValue("--green-700"),
        800: withOpacityValue("--green-800"),
        900: withOpacityValue("--green-900"),
    },
    yellow: {
        100: withOpacityValue("--yellow-100"),
        200: withOpacityValue("--yellow-200"),
        300: withOpacityValue("--yellow-300"),
        400: withOpacityValue("--yellow-400"),
        500: withOpacityValue("--yellow-500"),
        600: withOpacityValue("--yellow-600"),
        700: withOpacityValue("--yellow-700"),
        800: withOpacityValue("--yellow-800"),
        900: withOpacityValue("--yellow-900"),
    },
    teal: {
        100: withOpacityValue("--teal-100"),
        200: withOpacityValue("--teal-200"),
        300: withOpacityValue("--teal-300"),
        400: withOpacityValue("--teal-400"),
        500: withOpacityValue("--teal-500"),
        600: withOpacityValue("--teal-600"),
        700: withOpacityValue("--teal-700"),
        800: withOpacityValue("--teal-800"),
        900: withOpacityValue("--teal-900"),
    },
    grey: {
        100: withOpacityValue("--grey-100"),
        200: withOpacityValue("--grey-200"),
        300: withOpacityValue("--grey-300"),
        400: withOpacityValue("--grey-400"),
        500: withOpacityValue("--grey-500"),
        600: withOpacityValue("--grey-600"),
        700: withOpacityValue("--grey-700"),
        800: withOpacityValue("--grey-800"),
    },
    "blue-grey": {
        100: withOpacityValue("--blue-grey-100"),
        200: withOpacityValue("--blue-grey-200"),
        300: withOpacityValue("--blue-grey-300"),
        400: withOpacityValue("--blue-grey-400"),
        500: withOpacityValue("--blue-grey-500"),
        600: withOpacityValue("--blue-grey-600"),
        700: withOpacityValue("--blue-grey-700"),
        800: withOpacityValue("--blue-grey-800"),
    },
    "dotsub-blue": {
        "light": withOpacityValue("--dotsub-blue-light"),
        "lighter": withOpacityValue("--dotsub-blue-lighter"),
        "highlight": withOpacityValue("--dotsub-blue-highlight"),
        "main": withOpacityValue("--dotsub-blue-main"),
    },
    "dotsub-green": {
        "main": withOpacityValue("--dotsub-green-main"),
        "light": withOpacityValue("--dotsub-green-light"),
        "lighter": withOpacityValue("--dotsub-green-ligther"),
    }
}

const colorStates = {
    "warning": withOpacityValue("--warning"),
    "danger": withOpacityValue("--danger"),
    "success": withOpacityValue("--success"),
    "info": withOpacityValue("--info"),
}

const bodyBackground = "rgb(var(--body-background))";
const footerBackground = "rgb(var(--footer-background))";

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
