// Máy chủ tĩnh nhỏ: (1) để trình duyệt cho phép đọc điểm ảnh của ảnh cục bộ, (2) tự liệt kê ảnh trong thư mục
const http = require('http'), fs = require('fs'), path = require('path');
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif',
  '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.ogg': 'audio/ogg'
};
const IMG = /\.(jpe?g|png|webp|gif)$/i;
const PORT = 8080;
http.createServer((req, res) => {
  const u = new URL(req.url, 'http://localhost');
  if (u.pathname === '/api/list') {
    const abs = path.join(__dirname, path.normalize(u.searchParams.get('dir') || ''));
    if (!abs.startsWith(__dirname)) { res.writeHead(403); return res.end(); }
    return fs.readdir(abs, { withFileTypes: true }, (e, list) => {
      const files = e ? [] : list.filter(d => d.isFile() && IMG.test(d.name)).map(d => d.name).sort();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(files));
    });
  }
  let p = decodeURIComponent(u.pathname);
  if (p === '/') p = '/index.html';
  const f = path.join(__dirname, path.normalize(p));
  if (!f.startsWith(__dirname)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(f).toLowerCase()] || 'application/octet-stream' });
    res.end(d);
  });
}).listen(PORT, () => console.log('Mở http://localhost:' + PORT));
