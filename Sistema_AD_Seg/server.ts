import express from 'express';
import { resolve, join } from 'path';

export function app(): express.Express {
  const server = express();
  const browserDistFolder = resolve(__dirname, '../dist/sistema-adseg');
  const indexHtml = join(browserDistFolder, 'index.html');

  // Serve static files from the dist folder
  server.use(express.static(browserDistFolder, { maxAge: '1y' }));

  // Handle all routes by sending the index.html
  server.get('*', (req, res) => {
    res.sendFile(indexHtml);
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
