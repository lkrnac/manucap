module.exports = {
    "env": {
        "browser": true
    },
    "extends": ["plugin:@typescript-eslint/recommended", "plugin:react/recommended"],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.json",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint",
        "@typescript-eslint/tslint"
    ],
    "rules": {
        "@typescript-eslint/ban-ts-ignore": "off"
    }
};
