import { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        "\\.(css|scss|sass)$": "identity-obj-proxy",
    },
    collectCoverageFrom: [
        "src/**/*.{js,jsx,ts,tsx}",
        "!node_modules/**"
    ],
    resetMocks: false,
    // TODO: remove unused config
    // transform: {
    //     "^.+\\.(ts|tsx)$": "ts-jest", // Ensures TS files are transpiled
    //     "^.+\\.(js|jsx|mjs|cjs)$": "babel-jest", // Ensures JS files are handled by Babel
    // },
    // preset: "ts-jest/presets/default-esm", // Use ESM preset
    // testEnvironment: "jest-environment-jsdom",
    // transform: {
    //     "^.+\\.(ts|tsx|js|jsx|mjs|cjs)$": [
    //         "ts-jest",
    //         {
    //             useESM: true, // Ensure TypeScript files are treated as ESM
    //             tsconfig: "tsconfig.json",
    //         }
    //     ],
    // },
    // moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    // setupFilesAfterEnv: ["@testing-library/jest-dom"],
    // transformIgnorePatterns: [
    //     "/node_modules/(?!(@hookform/resolvers/joi|react-hook-form)/)", // Add primereact here
    // ],
    // extensionsToTreatAsEsm: [".ts", ".tsx"], // Treat TS as ES Modules
    // transform: {
    //     "^.+\\.(ts|tsx|js|jsx)$": "babel-jest",
    // },
    // transformIgnorePatterns: [
    //     "/node_modules/(?!@hookform/resolvers|your-other-esm-package)/",
    // ],
    // globals: {
    //     "ts-jest": {
    //         useESM: true, // Ensures TypeScript is transpiled to ESM
    //         tsconfig: "tsconfig.json",
    //     },
    // },
};

export default config;
