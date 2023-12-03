const { execSync } = require('child_process');
const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs');

describe('gendiff', () => {
  const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
  const getFileFormat = (filename) => {
    return filename.endsWith('.yaml') || filename.endsWith('.yml') ? 'yaml' : 'json';
  }
  const yamlToJson = (filepath) => {
    try {
      const fileContents = fs.readFileSync(filepath, 'utf8');
      return yaml.load(fileContents);
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  const runGendiff = (filename1, filename2) => {
    const format1 = getFileFormat(filename1);
    const format2 = getFileFormat(filename2);

    const filepath1 = getFixturePath(filename1);
    const filepath2 = getFixturePath(filename2);

    const file1 = format1 === 'yaml' ? yamlToJson(filepath1) : require(filepath1);
    const file2 = format2 === 'yaml' ? yamlToJson(filepath2) : require(filepath2);

    return execSync(`node ./gendiff.js ${file1} ${file2}`).toString();
  };

  test('compares two flat JSON files with no differences', () => {
    const result = runGendiff('file1.json', 'file1.json');
    expect(result).toBe(`{
   follow: false
   host: hexlet.io
   proxy: 123.234.53.22
   timeout: 50
}\n`);
  });


  test('compares two flat JSON files with differences', () => {
    const result = runGendiff('file1.json', 'file2.json');
    expect(result).toBe(`{
 - follow: false
   host: hexlet.io
 - proxy: 123.234.53.22
 - timeout: 50
 + timeout: 20
 + verbose: true
}\n`);
  });

});