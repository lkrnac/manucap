/** @type {import("tailwindcss").Config} **/

module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx,html}"
    ],
    theme: {
        colors: {
            transparent: "transparent",
            current: "currentColor",
            white: "rgb(var(--white))",
            black: "rgb(var(--black))",
            red: {
                "lighter": "rgb(var(--red-lighter))",
                "light": "rgb(var(--red-light))",
                "light-semi-transparent": `rgba(var(--red-light), 0.4)`,
                "light-mostly-transparent": `rgba(var(--red-light), 0.2)`,
                "primary": "rgb(var(--red-primary))",
                "primary-quasi-opaque": `rgba(var(--red-primary), 0.9)`,
                "primary-semi-transparent": `rgba(var(--red-primary), 0.4)`,
                "primary-mostly-transparent": `rgba(var(--red-primary), 0.2)`,
                "primary-quasi-transparent": `rgba(var(--red-primary), 0.1)`,
                "dark": "rgb(var(--red-dark))",
                "dark-mostly-opaque": `rgba(var(--red-dark), 0.8)`,
                "dark-quasi-transparent": `rgba(var(--red-dark), 0.1)`,
            },
            blue: {
                "lighter": "rgb(var(--blue-lighter))",
                "light": "rgb(var(--blue-light))",
                "light-mostly-opaque": `rgba(var(--blue-light), 0.8)`,
                "light-semi-opaque": `rgba(var(--blue-light), 0.6)`,
                "light-semi-transparent": `rgba(var(--blue-light), 0.4)`,
                "light-mostly-transparent": `rgba(var(--blue-light), 0.2)`,
                "light-quasi-transparent": `rgba(var(--blue-light), 0.1)`,
                "primary": "rgb(var(--blue-primary))",
                "primary-mostly-opaque": `rgba(var(--blue-primary), 0.8)`,
                "primary-semi-transparent": `rgba(var(--blue-primary), 0.4)`,
                "primary-mostly-transparent": `rgba(var(--blue-primary), 0.2)`,
                "primary-quasi-transparent": `rgba(var(--blue-primary), 0.1)`,
                "dark": "rgb(var(--blue-dark))",
                "dark-mostly-opaque": `rgba(var(--blue-dark), 0.8)`,
                "darker": "rgb(var(--blue-darker))",
            },
            green: {
                "lighter": "rgb(var(--green-lighter))",
                "light": "rgb(var(--green-light))",
                "light-semi-transparent": `rgba(var(--green-light), 0.4)`,
                "light-mostly-transparent": `rgba(var(--green-light), 0.2)`,
                "primary": "rgb(var(--green-primary))",
                "primary-quasi-opaque": `rgba(var(--green-primary), 0.9)`,
                "primary-semi-transparent": `rgba(var(--green-primary), 0.4)`,
                "primary-quasi-transparent": `rgba(var(--green-primary), 0.1)`,
                "dark": "rgb(var(--green-dark))",
                "dark-mostly-opaque": `rgba(var(--green-dark), 0.8)`,
            },
            yellow: {
                "lighter": "rgb(var(--yellow-lighter))",
                "light": "rgb(var(--yellow-light))",
                "light-semi-transparent": `rgba(var(--yellow-light), 0.4)`,
                "light-mostly-transparent": `rgba(var(--yellow-light), 0.2)`,
                "primary": "rgb(var(--yellow-primary))",
                "primary-semi-transparent": `rgba(var(--yellow-primary), 0.4)`,
                "primary-quasi-transparent": `rgba(var(--yellow-primary), 0.1)`,
                "dark": "rgb(var(--yellow-dark))"
            },
            gray: {
                "0": `rgb(var(--gray-0))`,
                "100": `rgb(var(--gray-1))`,
                "100-semi-transparent": `rgba(var(--gray-1), 0.4)`,
                "100-semi-opaque": `rgba(var(--gray-1), 0.6)`,
                "200": `rgb(var(--gray-2))`,
                "300": `rgb(var(--gray-3))`,
                "400": `rgb(var(--gray-4))`,
                "500": `rgb(var(--gray-5))`,
                "600": `rgb(var(--gray-6))`,
                "700": `rgb(var(--gray-7))`,
                "700-quasi-opaque": `rgb(var(--gray-7), 0.9)`,
                "800": `rgb(var(--gray-8))`,
                "900": `rgb(var(--gray-8))`,
                "900-semi-opaque": `rgb(var(--gray-9), 0.6)`,
                "900-mostly-opaque": `rgb(var(--gray-9), 0.8)`,
            },
            slate: {
                "0": `rgb(var(--slate-0))`,
            }
        },
        opacity: {
            "full": 1,
            "quasi-opaque": 0.9,
            "mostly-opaque": 0.8,
            "semi-opaque": 0.6,
            "semi-transparent": 0.4,
            "mostly-transparent": 0.2,
            "quasi-transparent": 0.1,
            "none": 0
        },
        extend: {
            width: {
                "half": "50vw"
            },
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
