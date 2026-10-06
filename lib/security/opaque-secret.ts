export function createOpaqueSecret(bytes = 32) {
  const values = new Uint8Array(bytes);
  globalThis.crypto.getRandomValues(values);

  return Array.from(values)
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}
