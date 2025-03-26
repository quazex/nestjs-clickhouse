module.exports = {
    extends: '@quazex/eslint-config',
    parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        ecmaVersion: 2021,
        sourceType: 'module',
    },
    ignorePatterns: [
        'lib',
        '.eslintrc.*',
    ],
    rules: {
        '@typescript-eslint/no-explicit-any': ['off'],
    },
}
