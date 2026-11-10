/**
 * Client-side password hashing for the demo.
 * SHA-256 with a fixed demo salt keeps raw passwords out of localStorage.
 * This is NOT production authentication — see README before deploying.
 */
export async function hashPassword(password) {
  const input = `veloop-demo::${password}`;
  if (globalThis.crypto?.subtle) {
    const bytes = new TextEncoder().encode(input);
    const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback for very old browsers (not cryptographically strong).
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  return `${(h1 >>> 0).toString(16)}${(h2 >>> 0).toString(16)}`;
}
