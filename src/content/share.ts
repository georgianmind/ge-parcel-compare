/**
 * Draws a shareable summary card (Night style, 2x) onto a canvas and
 * triggers a PNG download. Pure client-side; user-gesture initiated.
 */
import type { Lang } from './i18n';
import { MONTHS, t } from './i18n';

export interface ShareData {
  title: string;
  domain: string;
  routeFrom: string; // e.g. "ATH"
  flag: string;
  totalGEL: number;
  pagePrice: string; // "45.95 €"
  carriers: Array<{ name: string; priceGEL: number; days?: string; best: boolean }>;
  productValueGEL: number;
  vatDue: boolean;
  customsGEL: number;
  arrival?: string;
  lang: Lang;
}

const F = (w: number, s: number) =>
  `${w} ${s}px -apple-system, "SF Pro Display", "Helvetica Neue", "Noto Sans Georgian", sans-serif`;

function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

export function downloadShareCard(d: ShareData): void {
  const S = 2; // supersample
  const W = 640, H = 760;
  const cv = document.createElement('canvas');
  cv.width = W * S;
  cv.height = H * S;
  const c = cv.getContext('2d');
  if (!c) return;
  c.scale(S, S);

  // backdrop
  const bg = c.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#17181d');
  bg.addColorStop(1, '#0c0d10');
  c.fillStyle = bg;
  c.fillRect(0, 0, W, H);
  // red aura
  const aura = c.createRadialGradient(W * 0.82, 40, 10, W * 0.82, 40, 380);
  aura.addColorStop(0, 'rgba(229,72,77,.22)');
  aura.addColorStop(1, 'rgba(229,72,77,0)');
  c.fillStyle = aura;
  c.fillRect(0, 0, W, H);

  const X = 56;
  let y = 76;

  // route pill
  c.font = F(650, 17);
  const routeTxt = `${d.flag} ${d.routeFrom}   ✈   TBS`;
  const rw = c.measureText(routeTxt).width + 44;
  c.fillStyle = 'rgba(255,255,255,.07)';
  rr(c, X, y - 26, rw, 40, 20);
  c.fill();
  c.fillStyle = '#f4f5f7';
  c.fillText(`${d.flag} ${d.routeFrom}`, X + 22, y + 1);
  c.fillStyle = '#ff6b70';
  c.fillText('TBS', X + rw - 58, y + 1);
  c.fillStyle = '#6a6d74';
  c.font = F(400, 13);
  c.fillText('✈', X + rw / 2 - 6, y);

  // title
  y += 64;
  c.fillStyle = '#999da4';
  c.font = F(600, 15);
  const titleUp = d.title.length > 44 ? d.title.slice(0, 43) + '…' : d.title;
  c.fillText(titleUp, X, y);
  c.fillStyle = '#6a6d74';
  c.font = F(500, 13);
  c.fillText(`${d.domain.toUpperCase()} · ${d.pagePrice}`, X, y + 24);

  // hero
  y += 118;
  c.fillStyle = '#999da4';
  c.font = F(700, 13);
  c.fillText(t(d.lang, 'totalToTbilisi').toUpperCase(), X, y - 72);
  const heroGrad = c.createLinearGradient(0, y - 60, 0, y);
  heroGrad.addColorStop(0, '#ffffff');
  heroGrad.addColorStop(1, '#b9bcc4');
  c.fillStyle = heroGrad;
  c.font = F(750, 76);
  const heroTxt = `≈${Math.round(d.totalGEL)}`;
  c.fillText(heroTxt, X - 4, y);
  const hw = c.measureText(heroTxt).width;
  c.save();
  c.shadowColor = 'rgba(229,72,77,.6)';
  c.shadowBlur = 24;
  c.fillStyle = '#ff6b70';
  c.font = F(650, 46);
  c.fillText(' ₾', X + hw, y);
  c.restore();

  c.fillStyle = d.vatDue ? '#ff6b70' : '#4ade80';
  c.font = F(600, 16);
  c.fillText(
    d.vatDue
      ? `+${Math.round(d.customsGEL)} ₾ ${t(d.lang, 'vat')} 18%`
      : t(d.lang, 'dutyFreeShort'),
    X,
    y + 34,
  );
  if (d.arrival) {
    c.fillStyle = '#999da4';
    c.fillText(`· ${t(d.lang, 'arrives')} ${d.arrival}`, X + (d.vatDue ? 150 : 110), y + 34);
  }

  // meter
  y += 70;
  const mw = W - X * 2;
  const grad = c.createLinearGradient(X, 0, X + mw, 0);
  grad.addColorStop(0, '#22c55e');
  grad.addColorStop(0.42, '#eab308');
  grad.addColorStop(0.62, '#e5484d');
  grad.addColorStop(1, '#e5484d');
  c.fillStyle = grad;
  rr(c, X, y, mw, 7, 4);
  c.fill();
  const pos = Math.min(d.productValueGEL / 600, 1);
  c.fillStyle = 'rgba(16,17,20,.82)';
  rr(c, X + mw * pos, y, mw * (1 - pos), 7, 4);
  c.fill();
  c.save();
  c.shadowColor = d.vatDue ? 'rgba(229,72,77,.9)' : 'rgba(34,197,94,.9)';
  c.shadowBlur = 16;
  c.beginPath();
  c.arc(X + mw * pos, y + 3.5, 8, 0, Math.PI * 2);
  c.fillStyle = '#fff';
  c.fill();
  c.restore();
  c.fillStyle = '#6a6d74';
  c.font = F(600, 12);
  c.fillText(`${Math.round(d.productValueGEL)} ₾ / 300 ₾`, X, y + 30);

  // carrier rows
  y += 62;
  for (const cr of d.carriers.slice(0, 3)) {
    const h = 64;
    c.fillStyle = cr.best ? 'rgba(229,72,77,.13)' : 'rgba(255,255,255,.04)';
    rr(c, X, y, mw, h, 16);
    c.fill();
    if (cr.best) {
      c.strokeStyle = 'rgba(229,72,77,.4)';
      c.lineWidth = 1.5;
      rr(c, X, y, mw, h, 16);
      c.stroke();
    }
    c.fillStyle = '#f4f5f7';
    c.font = F(650, 17);
    c.fillText(cr.name, X + 22, y + 28);
    c.fillStyle = '#6a6d74';
    c.font = F(500, 12);
    c.fillText(cr.days ? `${cr.days} ${t(d.lang, 'days')}` : '', X + 22, y + 48);
    c.font = F(700, 19);
    c.fillStyle = cr.best ? '#ff8a8e' : '#f4f5f7';
    const p = `${Math.round(cr.priceGEL)} ₾`;
    c.fillText(p, X + mw - c.measureText(p).width - 22, y + 34);
    y += h + 10;
  }

  // footer
  const today = new Date();
  c.fillStyle = '#4e5058';
  c.font = F(600, 12);
  c.fillText(
    `${today.getDate()} ${MONTHS[d.lang][today.getMonth()]} · NBG FX`,
    X,
    H - 44,
  );
  c.save();
  c.fillStyle = '#ff6b70';
  c.font = F(750, 14);
  const wm = 'ამანათი · Amanati';
  c.fillText(wm, W - X - c.measureText(wm).width, H - 44);
  c.restore();

  cv.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amanati-${Math.round(d.totalGEL)}gel.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, 'image/png');
}
