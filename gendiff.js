const { Command } = require('commander');
const packageJson = require('./package.json');

const program = new Command();

program
  .version(packageJson.version)
  .description("Compares two configuration files and shows a difference.")
  .action(() => {
    console.log('Hello world!');
  });

program.parse(process.argv);
