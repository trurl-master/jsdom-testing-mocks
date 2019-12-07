module.exports = {
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest'
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/']
}
