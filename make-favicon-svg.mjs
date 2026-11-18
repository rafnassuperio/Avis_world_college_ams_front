import fs from 'fs';

const pngData = fs.readFileSync('public/pwa-512x512.png');
const base64 = pngData.toString('base64');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image href="data:image/png;base64,${base64}" width="512" height="512" />
</svg>
`;

fs.writeFileSync('public/favicon.svg', svg);
console.log('favicon.svg updated with Avis emblem, size:', svg.length);

