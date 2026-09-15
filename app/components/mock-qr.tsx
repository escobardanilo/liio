function isFinder(x: number, y: number, ox: number, oy: number) {
  const dx = x - ox, dy = y - oy;
  if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return false;
  return dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
}

export function MockQr() {
  const cells = Array.from({ length: 441 }, (_, index) => {
    const x = index % 21, y = Math.floor(index / 21);
    const finder = isFinder(x, y, 0, 0) || isFinder(x, y, 14, 0) || isFinder(x, y, 0, 14);
    const quiet = (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
    const pseudo = ((x * 17 + y * 31 + x * y * 7) % 11) < 5;
    return <span key={index} data-on={finder || (!quiet && pseudo)} />;
  });
  return <div className="qr-grid" aria-label="Device pairing QR code">{cells}</div>;
}
