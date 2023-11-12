const { Command } = require('commander')
const fs = require('fs')
const path = require('path')
const packageJson = require('./package.json')
var _ = require('lodash')

const program = new Command();

const parsers = {
  '.json': JSON.parse,
  '.yaml': undefined,
  '.yml': undefined,
}

const fileData = (filepath) => {
  const absolutePath = path.resolve(filepath);
  const fileExtestion = path.extname(absolutePath);
  const parser = parsers[fileExtestion];
  if (!parser) {
    throw new Error("Unsupported file format: ${fileExtension}");
  }
  const data = fs.readFileSync(absolutePath, 'utf-8');
  return parser(data)
}

program
  .version(packageJson.version)
  .description("Compares two configuration files and shows a difference.")
  .option("-f, --format <type>", "output format")
  .argument('<filepath1>', 'path to the first source')
  .argument('<filepath2>', 'path to the second source')
  .action((filepath1, filepath2) => {
    let result = '{\n';
    const file1 = fileData(filepath1);
    const file2 = fileData(filepath2);
    const allKeys = new Set([...Object.keys(file1), ...Object.keys(file2)]);
    const sortedKeys = _.orderBy(Array.from(allKeys));

    for (const key of sortedKeys) {
      if (file1[key] === file2[key]) {
        result += `   ${key}: ${file1[key]}\n`
      } else {
        if (file1.hasOwnProperty(key)) {
          result += ` - ${key}: ${file1[key]}\n`
        }
        if (file2.hasOwnProperty(key)) {
          result += ` + ${key}: ${file2[key]}\n`
        }
      }
    }
    result += '}'
    console.log(result)
  });


program.parse(process.argv);
