const { execSync } = require('child_process');
const path = require('path');

describe('gendiff', () => {
  const getFixturePath = (filename) => path.join(__dirname, '__fixtures__', filename);
  const runGendiff = (filename1, filename2) => {
    const filepath1 = getFixturePath(filename1);
    const filepath2 = getFixturePath(filename2);
    return execSync(`node ./gendiff.js ${filepath1} ${filepath2}`).toString();
  };

  test('compares two flat JSON files with no differences', () => {
    const result = runGendiff('file1.json', 'file1.json');
    expect(result).toBe('{\n   // expected output when files are identical\n}');
  });

  test('compares two flat JSON files with differences', () => {
    const result = runGendiff('file1.json', 'file2.json');
    expect(result).toBe('{\n   // expected output when files are different\n}');
  });

});