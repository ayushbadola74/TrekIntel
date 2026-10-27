import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8080;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];

  // Route root to index.html
  if (reqUrl === '/' || reqUrl === '/index.html') {
    reqUrl = '/html/index.html';
  }

  // Handle asset paths requested with /html prefix
  if (reqUrl.startsWith('/html/css/')) {
    reqUrl = reqUrl.replace('/html/css/', '/css/');
  } else if (reqUrl.startsWith('/html/js/')) {
    reqUrl = reqUrl.replace('/html/js/', '/js/');
  } else if (reqUrl.startsWith('/html/assets/')) {
    reqUrl = reqUrl.replace('/html/assets/', '/assets/');
  }

  // If requesting a clean URL like /explore or /login, or direct /explore.html
  if (!path.extname(reqUrl)) {
    const candidate = path.join(PUBLIC_DIR, 'html', reqUrl + '.html');
    if (fs.existsSync(candidate)) {
      reqUrl = '/html' + reqUrl + '.html';
    }
  } else if (path.extname(reqUrl) === '.html' && !reqUrl.startsWith('/html/')) {
    const candidate = path.join(PUBLIC_DIR, 'html', reqUrl);
    if (fs.existsSync(candidate)) {
      reqUrl = '/html' + reqUrl;
    }
  }

  const filePath = path.join(PUBLIC_DIR, reqUrl);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: ' + reqUrl);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`TrekIntel server listening on http://localhost:${PORT}`);
});
