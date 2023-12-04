#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const packageJson = require('./package.json');
var _ = require('lodash');
const yaml = require('js-yaml');


const program = new Command();

const fileData = (filepath) => {
  const absolutePath = path.resolve(filepath);
  const data = fs.readFileSync(absolutePath, 'utf-8');
  if (filepath.endsWith('.yml') || filepath.endsWith('.yaml')) {
    return yaml.load(data);
  }
  return JSON.parse(data);
};

const formatPlain = (file1, file2) => {
  let result = [];
  const keys = _.union(_.keys(file1), _.keys(file2));

  keys.forEach(key => {
    if (!_.has(file2, key)) {
      result.push(`Property '${key}' was removed`);
    } else if (!_.has(file1, key)) {
      result.push(`Property '${key}' was added with value: ${JSON.stringify(file2[key])}`);
    } else if (file1[key] !== file2[key]) {
      result.push(`Property '${key}' was updated. From ${JSON.stringify(file1[key])} to ${JSON.stringify(file2[key])}`);
    }
  });

  return result.join('\n');
};

const formatStylish = (file1, file2) => {
  let result = '{\n';
  const keys = _.union(_.keys(file1), _.keys(file2));

  keys.forEach(key => {
    if (!_.has(file2, key)) {
      result += `   - ${key}: ${JSON.stringify(file1[key])}\n`;
    } else if (!_.has(file1, key)) {
      result += `   + ${key}: ${JSON.stringify(file2[key])}\n`;
    } else if (file1[key] !== file2[key]) {
      result += `   - ${key}: ${JSON.stringify(file1[key])}\n`;
      result += `   + ${key}: ${JSON.stringify(file2[key])}\n`;
    } else {
      result += `     ${key}: ${JSON.stringify(file1[key])}\n`;
    }
  });

  result += '}';
  return result;
};

const formatOutput = (file1, file2, format) => {
  switch (format) {
    case 'plain':
      return formatPlain(file1, file2);
    case 'stylish':
    default:

      return formatStylish(file1, file2);
  }
};

const formatJson = (file1, file2) => {
  const diff = {};
  const keys = _.union(_.keys(file1), _.keys(file2));

  keys.forEach(key => {
    if (!_.has(file2, key)) {
      diff[key] = { status: 'removed', oldValue: file1[key] };
    } else if (!_.has(file1, key)) {
      diff[key] = { status: 'added', newValue: file2[key] };
    } else if (file1[key] !== file2[key]) {
      diff[key] = { status: 'updated', oldValue: file1[key], newValue: file2[key] };
    } else {
      diff[key] = { status: 'unchanged', value: file1[key] };
    }
  });

  return JSON.stringify(diff, null, 2);
};

program
  .version(packageJson.version)
  .description("Compares two configuration files and shows a difference.")
  .option("-f, --format <type>", "output format", 'stylish')
  .argument('<filepath1>', 'path to the first source')
  .argument('<filepath2>', 'path to the second source')
  .action((filepath1, filepath2, options) => {
    const file1 = fileData(filepath1);
    const file2 = fileData(filepath2);
    const format = options.format || 'stylish';

    switch (format) {
      case 'json':
        console.log(formatJson(file1, file2));
        break;
      case 'plain':
        console.log(formatPlain(file1, file2));
        break;
      case 'stylish':
      default:
        console.log(formatStylish(file1, file2));
    }
  });

if (require.main === module) {
  program.parse(process.argv);
}
module.exports = program;

