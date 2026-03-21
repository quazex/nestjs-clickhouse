import quazexConfig from '@quazex/eslint-config'
import { globalIgnores } from 'eslint/config'

export const eslintIgnore = globalIgnores([
  'lib/**',
])

export default [
  ...quazexConfig,
  eslintIgnore,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': ['off'],
      'max-classes-per-file': ['off'],
    },
  },
]
