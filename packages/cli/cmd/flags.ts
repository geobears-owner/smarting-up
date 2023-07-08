export const commonFlags = {
  directory: {
    string: true,
    alias: ['d'],
    default: '.',
    describe: 'directory to look for content files'
  },
  verbose: {
    boolean: true,
    alias: ['v'],
    default: false,
    describe: 'print out extra logging information'
  },
}
