const fs = require('fs');
const path = require('path');

function filePath(name) {
  return path.join(__dirname, '..', 'data', `${name}.json`);
}

function readDB(name) {
  const file = filePath(name);
  if (!fs.existsSync(file)) fs.writeFileSync(file, '[]');
  const raw = fs.readFileSync(file, 'utf-8');
  return JSON.parse(raw || '[]');
}

function writeDB(name, data) {
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2));
}

module.exports = { readDB, writeDB };