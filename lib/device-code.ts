const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;
const VERSION = 1;
const BUCKET_MODULO = 4096;
const MAX_AGE_MINUTES = 10;

export type DecodedPairingCode = {
  age: number;
  initial: string;
  issuedMinutesAgo: number;
};

function checksum(payload: number) {
  let mixed = payload;

  mixed ^= mixed >>> 4;
  mixed ^= mixed >>> 8;
  mixed ^= mixed >>> 12;
  mixed ^= mixed >>> 16;
  mixed ^= mixed >>> 20;

  return mixed & 0x0f;
}

function encodeValue(value: number) {
  let remaining = value >>> 0;
  let output = "";

  for (let index = 0; index < CODE_LENGTH; index += 1) {
    output = ALPHABET[remaining & 31] + output;
    remaining >>>= 5;
  }

  return output;
}

function decodeValue(code: string) {
  let value = 0;

  for (const character of code) {
    const index = ALPHABET.indexOf(character);

    if (index < 0) {
      return null;
    }

    value = value * 32 + index;
  }

  return value >>> 0;
}

function randomThreeBits() {
  const bytes = new Uint8Array(1);

  globalThis.crypto.getRandomValues(bytes);

  return bytes[0] & 0x07;
}

function getInitialIndex(name: string) {
  const initial = name.trim().charAt(0).toUpperCase();
  const code = initial.charCodeAt(0);

  if (code >= 65 && code <= 90) {
    return code - 65;
  }

  return 26;
}

function formatCode(rawCode: string) {
  return `${rawCode.slice(0, 3)}-${rawCode.slice(3)}`;
}

export function normalizePairingCode(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, CODE_LENGTH);
}

export function createPairingCode(
  name: string,
  age: number,
  now = Date.now(),
) {
  const normalizedAge = Math.min(15, Math.max(6, Math.round(age)));
  const ageOffset = normalizedAge - 6;
  const initialIndex = getInitialIndex(name);
  const minuteBucket =
    Math.floor(now / 60000) % BUCKET_MODULO;
  const nonce = randomThreeBits();

  const payload =
    ((VERSION & 0x03) << 24) |
    ((minuteBucket & 0x0fff) << 12) |
    ((ageOffset & 0x0f) << 8) |
    ((initialIndex & 0x1f) << 3) |
    nonce;

  const value = ((payload << 4) | checksum(payload)) >>> 0;
  const rawCode = encodeValue(value);

  return {
    code: formatCode(rawCode),
    rawCode,
    expiresAt: now + MAX_AGE_MINUTES * 60000,
  };
}

export function decodePairingCode(
  value: string,
  now = Date.now(),
): DecodedPairingCode | null {
  const rawCode = normalizePairingCode(value);

  if (rawCode.length !== CODE_LENGTH) {
    return null;
  }

  const encoded = decodeValue(rawCode);

  if (encoded === null) {
    return null;
  }

  const expectedChecksum = encoded & 0x0f;
  const payload = encoded >>> 4;

  if (checksum(payload) !== expectedChecksum) {
    return null;
  }

  const version = (payload >>> 24) & 0x03;
  const minuteBucket = (payload >>> 12) & 0x0fff;
  const ageOffset = (payload >>> 8) & 0x0f;
  const initialIndex = (payload >>> 3) & 0x1f;

  if (version !== VERSION || ageOffset > 9 || initialIndex > 26) {
    return null;
  }

  const currentBucket =
    Math.floor(now / 60000) % BUCKET_MODULO;
  const issuedMinutesAgo =
    (currentBucket - minuteBucket + BUCKET_MODULO) %
    BUCKET_MODULO;

  if (issuedMinutesAgo > MAX_AGE_MINUTES) {
    return null;
  }

  return {
    age: ageOffset + 6,
    initial:
      initialIndex <= 25
        ? String.fromCharCode(65 + initialIndex)
        : "?",
    issuedMinutesAgo,
  };
}
