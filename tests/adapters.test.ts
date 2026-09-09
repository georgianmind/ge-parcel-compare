import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { zaraAdapter } from '../src/adapters/zara';
import { genericAdapter } from '../src/adapters/generic';
import { adapterFor } from '../src/adapters';
import { categorize } from '../src/data/weights';

function loadFixture(name: string): Document {
  const html = readFileSync(join(import.meta.dirname, 'fixtures', name), 'utf8');
  return new DOMParser().parseFromString(html, 'text/html');
}

describe('adapter registry', () => {
  it('routes zara.com to the Zara adapter', () => {
    expect(adapterFor(new URL('https://www.zara.com/gr/en/x-p1.html')).id).toBe('zara');
  });
  it('falls back to generic for unknown sites', () => {
    expect(adapterFor(new URL('https://shop.example.de/product/1')).id).toBe('generic');
  });
});

describe('Zara adapter — GR clothing fixture (JSON-LD)', () => {
  const doc = loadFixture('zara-gr-clothing.html');
  const url = new URL('https://www.zara.com/gr/en/ribbed-dress-p01234567.html');
  const p = zaraAdapter.extract(doc, url)!;

  it('extracts title, price, currency from JSON-LD', () => {
    expect(p).not.toBeNull();
    expect(p.title).toBe('RIBBED DRESS');
    expect(p.priceAmount).toBe(45.95);
    expect(p.priceCurrency).toBe('EUR');
  });
  it('maps /gr locale to the Greece corridor with confidence', () => {
    expect(p.shipsFromCountry).toBe('greece');
    expect(p.corridorConfident).toBe(true);
  });
  it('categorizes as dress from URL slug/breadcrumbs', () => {
    expect(categorize(p.category)).toBe('dress');
  });
  it('picks up the image', () => {
    expect(p.imageUrl).toContain('static.zara.net');
  });
});

describe('Zara adapter — GR shoes fixture (JSON-LD array)', () => {
  const doc = loadFixture('zara-gr-shoes.html');
  const url = new URL('https://www.zara.com/gr/en/chunky-sole-trainers-p05678910.html');
  const p = zaraAdapter.extract(doc, url)!;

  it('finds the Product node inside a JSON-LD array', () => {
    expect(p.title).toBe('CHUNKY SOLE TRAINERS');
    expect(p.priceAmount).toBe(59.95);
  });
  it('categorizes as shoes (volumetric trap category)', () => {
    expect(categorize(p.category)).toBe('shoes');
  });
});

describe('Zara adapter — DE fixture (DOM fallback, no JSON-LD)', () => {
  const doc = loadFixture('zara-de-product.html');
  const url = new URL('https://www.zara.com/de/de/wasserabweisende-jacke-p09876543.html');
  const p = zaraAdapter.extract(doc, url)!;

  it('extracts from DOM selectors', () => {
    expect(p.title).toBe('WASSERABWEISENDE JACKE');
    expect(p.priceAmount).toBe(89.95);
    expect(p.priceCurrency).toBe('EUR');
  });
  it('maps /de locale to Germany', () => {
    expect(p.shipsFromCountry).toBe('germany');
  });
  it('categorizes as jacket', () => {
    expect(categorize(p.category)).toBe('jacket');
  });
});

describe('Zara adapter — non-product page', () => {
  it('returns null when nothing extractable', () => {
    const doc = new DOMParser().parseFromString('<html><body><h1></h1></body></html>', 'text/html');
    expect(zaraAdapter.extract(doc, new URL('https://www.zara.com/gr/en/'))).toBeNull();
  });
});

describe('generic adapter', () => {
  it('extracts from OpenGraph product meta', () => {
    const doc = new DOMParser().parseFromString(
      `<html lang="de-DE"><head>
        <meta property="og:title" content="Test Sneaker">
        <meta property="product:price:amount" content="79.99">
        <meta property="product:price:currency" content="EUR">
      </head><body></body></html>`,
      'text/html',
    );
    const p = genericAdapter.extract(doc, new URL('https://someshop.de/sneaker-123'))!;
    expect(p.title).toBe('Test Sneaker');
    expect(p.priceAmount).toBe(79.99);
    expect(p.shipsFromCountry).toBe('germany');
    expect(p.corridorConfident).toBe(false); // TLD/lang inference only
  });

  it('extracts from microdata', () => {
    const doc = new DOMParser().parseFromString(
      `<html><body>
        <div itemscope itemtype="https://schema.org/Product">
          <span itemprop="name">Wool Scarf</span>
          <span itemprop="price" content="19.90">19,90</span>
          <meta itemprop="priceCurrency" content="EUR">
        </div>
      </body></html>`,
      'text/html',
    );
    const p = genericAdapter.extract(doc, new URL('https://shop.gr/scarf'))!;
    expect(p.priceAmount).toBe(19.9);
    expect(p.shipsFromCountry).toBe('greece');
  });

  it('returns null on pages with no product signals', () => {
    const doc = new DOMParser().parseFromString('<html><body>blog post</body></html>', 'text/html');
    expect(genericAdapter.extract(doc, new URL('https://blog.example.com/post'))).toBeNull();
  });
});
