const { execSync } = require('child_process');
const path = require('path');

describe('gendiff', () => {
  const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

  const runGendiff = (filename1, filename2, format = '') => {
    const filepath1 = getFixturePath(filename1);
    const filepath2 = getFixturePath(filename2);
    const formatOption = format ? `--format ${format}` : '';

    return execSync(`node ./gendiff.js ${formatOption} ${filepath1} ${filepath2}`).toString();
  };

  // Тесты для JSON
  test('compares two flat JSON files with no differences', () => {
    const result = runGendiff('file1.json', 'file1.json');
    expect(result).toBe(`{
     host: "hexlet.io"
     timeout: 50
     proxy: "123.234.53.22"
     follow: false
}
`);
  });

  test('compares two flat JSON files with differences', () => {
    const result = runGendiff('file1.json', 'file2.json');
    expect(result).toBe(`{
     host: "hexlet.io"
   - timeout: 50
   + timeout: 20
   - proxy: "123.234.53.22"
   - follow: false
   + verbose: true
}
`);
  });

  // Тесты для YAML
  test('compares two flat YAML files with no differences', () => {
    const result = runGendiff('file1.yml', 'file1.yml');
    const expectedOutput = `{
     host: "hexlet.io"
     timeout: 50
     proxy: "123.234.53.22"
     follow: false
}
`
    expect(result).toBe(expectedOutput);
  });

  test('compares two flat YAML files with differences', () => {
    const result = runGendiff('file1.yml', 'file2.yml');
    const expectedOutput = `{
     host: "hexlet.io"
   - timeout: 50
   + timeout: 20
   - proxy: "123.234.53.22"
   - follow: false
   + verbose: true
}
`
    expect(result).toBe(expectedOutput);
  });

  // Тесты для разных форматов вывода
  test('compares two files with plain format output', () => {
    const result = runGendiff('file1.json', 'file2.json', 'plain');
    const expectedOutput = `Property 'timeout' was updated. From 50 to 20
Property 'proxy' was removed
Property 'follow' was removed
Property 'verbose' was added with value: true
`
    expect(result).toBe(expectedOutput);
  });

  test('compares two files with json format output', () => {
    const result = runGendiff('file1.json', 'file2.json', 'json');
    const expectedOutput = `{
  "host": {
    "status": "unchanged",
    "value": "hexlet.io"
  },
  "timeout": {
    "status": "updated",
    "oldValue": 50,
    "newValue": 20
  },
  "proxy": {
    "status": "removed",
    "oldValue": "123.234.53.22"
  },
  "follow": {
    "status": "removed",
    "oldValue": false
  },
  "verbose": {
    "status": "added",
    "newValue": true
  }
}
`
    expect(result).toBe(expectedOutput);
  });
});
