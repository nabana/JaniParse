const Baby = require('babyparse');
const fs = require('fs');
const path = require('path')

const commandLineArgs = require('command-line-args')

const optionDefinitions = [
  {name: 'sourceFilePath', alias: 's', type: String},
  {name: 'lookupFilePath', alias: 'l', type: String},
  {name: 'fkColumnIndex', alias: 'f', type: Number},
  {name: 'lookupPKColumnIndex', alias: 'p', type: Number},
  {name: 'additionalColumnIndex', alias: 'a', type: Number},
];

const options = commandLineArgs(optionDefinitions)

const sourceFilePath = options.sourceFilePath;
const lookupFilePath = options.lookupFilePath;
const fkColumnIndex = options.fkColumnIndex;
const lookupPKColumnIndex = options.lookupPKColumnIndex;
const additionalColumnIndex = options.additionalColumnIndex;

console.log('JaniParse v1.0.0');

if (
  sourceFilePath == null ||
  lookupFilePath == null ||
  fkColumnIndex == null ||
  lookupPKColumnIndex == null ||
  additionalColumnIndex == null
) {
  console.log('Error: Missing arguments!');
  console.log('Usage:');
  console.log('node index.js --sourceFilePath ./test_data/file1.csv --lookupFilePath ./test_data/file2.csv --fkColumnIndex 0 --lookupPKColumnIndex 0 --additionalColumnIndex');
  process.exit(1);
}

const sourceBuffer = fs.readFileSync(sourceFilePath, 'utf8');
const source = Baby.parse(sourceBuffer).data;

const lookupBuffer = fs.readFileSync(lookupFilePath, 'utf8');
const lookup = Baby.parse(lookupBuffer).data;

console.log(`Rows in source file: ${source.length}`);
console.log(`Rows in lookup file: ${lookup.length}`);

const extended = source.map(row => {
  const newRow = row.slice();
  const fk = newRow[fkColumnIndex];
  const lookupRow = lookup.find(
    rowInLookup => rowInLookup[lookupPKColumnIndex] ===  fk
  );

  if (lookupRow != null) {
    newRow.push(lookupRow[additionalColumnIndex]);
  }

  return newRow;
});

console.log(`Count of extended rows: ${extended.length}`);

const pathObj = path.parse(sourceFilePath);
const outPath = path.join(
  pathObj.root, pathObj.dir, `${pathObj.name}_extended${pathObj.ext}`
);
console.log(`Output: ${outPath}`);
fs.writeFileSync(outPath, Baby.unparse(extended));
