/**
 * AAKAR FILMS — Local Development Server
 * Run: node server.js
 * Then open: http://localhost:3000
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css':  'text/css',
    '.js':   'application/javascript',
    '.json': 'application/json',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png':  'image/png',
    '.gif':  'image/gif',
    '.svg':  'image/svg+xml',
    '.mp4':  'video/mp4',
    '.webm': 'video/webm',
    '.ico':  'image/x-icon',
};

const server = http.createServer((req, res) => {
    let urlPath = req.url.split('?')[0];
    if (urlPath === '/') urlPath = '/index.html';

    const filePath = path.join(ROOT, urlPath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 - Not Found');
            return;
        }
        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*',
        });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log('\n╔═══════════════════════════════════════╗');
    console.log('║      AAKAR FILMS — Local Server       ║');
    console.log('╠═══════════════════════════════════════╣');
    console.log('║  Running at: http://localhost:3000    ║');
    console.log('║  Open this URL in your browser!       ║');
    console.log('║  Press Ctrl+C to stop                 ║');
    console.log('╚═══════════════════════════════════════╝\n');
});
