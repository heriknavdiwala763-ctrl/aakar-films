/**
 * AAKAR FILMS — BACKEND SERVER (Node.js)
 * Uses native Node.js built-in modules (http, fs, path).
 * No extra npm installation required!
 *
 * To run (once Node.js is installed):
 *    node server.js
 * Then open: http://localhost:3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'bookings.json');

// Ensure bookings database file exists
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf8');
}

// MIME types dictionary for static file serving
const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'text/javascript; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Enable CORS for API
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // -------------------------------------------------------------------------
    // API Route: POST /api/book (Save a new photo shoot booking)
    // -------------------------------------------------------------------------
    if (req.url === '/api/book' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const booking = JSON.parse(body);
                booking.id = 'AK-' + Date.now();
                booking.createdAt = new Date().toISOString();
                booking.status = 'Pending';

                // Read existing bookings
                const data = fs.readFileSync(DB_FILE, 'utf8');
                const bookings = JSON.parse(data || '[]');
                bookings.unshift(booking);

                // Save back to file
                fs.writeFileSync(DB_FILE, JSON.stringify(bookings, null, 2), 'utf8');

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    message: 'Booking saved successfully',
                    booking: booking
                }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
        return;
    }

    // -------------------------------------------------------------------------
    // API Route: GET /api/bookings (Retrieve all photo shoot bookings)
    // -------------------------------------------------------------------------
    if (req.url === '/api/bookings' && req.method === 'GET') {
        try {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
    }

    // -------------------------------------------------------------------------
    // Static File Serving (HTML, CSS, JS, Images)
    // -------------------------------------------------------------------------
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') {
        reqPath = '/index.html';
    } else if (reqPath === '/admin' || reqPath === '/admin/') {
        reqPath = '/admin/login.html';
    }

    const filePath = path.join(__dirname, reqPath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` AAKAR FILMS Backend Server Running!           `);
    console.log(` Local URL: http://localhost:${PORT}          `);
    console.log(` Contact Number: +91 63548 96783              `);
    console.log(`===============================================`);
});

