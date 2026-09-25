const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });

function requestLogger(req, res, next) {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  res.on('finish', () => {
    const elapsed = Date.now() - start;
    const logLine = `[${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode} ${elapsed}ms - IP: ${req.ip}\n`;
    accessLogStream.write(logLine);
  });

  next();
}

module.exports = { requestLogger, accessLogStream };
