import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { test } from 'node:test';

test('production scripts and styles resolve inside the GitHub Pages project', async () => {
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  const assets = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map(match => match[1]);
  assert.ok(assets.some(asset => asset.endsWith('.js')), 'Missing JavaScript entry');
  assert.ok(assets.some(asset => asset.endsWith('.css')), 'Missing stylesheet');
  for (const asset of assets) {
    const url = new URL(asset, 'https://cesarportech.github.io/CARNE/');
    assert.equal(url.origin, 'https://cesarportech.github.io');
    assert.ok(url.pathname.startsWith('/CARNE/'), `Asset escapes project: ${asset}`);
    await access(new URL(`../dist/${url.pathname.slice('/CARNE/'.length)}`, import.meta.url));
  }
});

test('all 13 participant photos are included in the Pages artifact', async () => {
  for (let index = 1; index <= 13; index++) {
    await access(new URL(`../dist/fotos/foto${index}.jpg`, import.meta.url));
  }
});
