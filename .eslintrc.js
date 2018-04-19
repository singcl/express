module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module"
    },
    "plugins": ["mocha"],
    "rules": {
        "mocha/no-exclusive-tests": "error",
        "indent": ["error",4],
        "quotes": ["error","single"],
        "semi": ["error", "never"],
        "no-console": 0,
        "no-unused-vars": ["error", {"args": "none"}]
    }
};