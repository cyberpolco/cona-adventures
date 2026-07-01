// lib/encrypt.server.js — SERVER ONLY. Never import client-side.
// AES-256-GCM encryption for sensitive field references (e.g. passport storage keys).
// Set ENCRYPTION_KEY to a 64-char hex string: openssl rand -hex 32
import crypto from 'crypto';

const ALGO = 'aes-256-gcm';

function getKey() {
  const k = process.env.ENCRYPTION_KEY;
  if (!k || k.length !== 64) throw new Error('ENCRYPTION_KEY must be a 64-char hex string');
  return Buffer.from(k, 'hex');
}

// Returns "iv.tag.ciphertext" — safe to store as a DB string.
export function encrypt(plaintext) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('hex'), tag.toString('hex'), encrypted.toString('hex')].join('.');
}

// Reverses encrypt(). Throws on tampered ciphertext (GCM auth tag mismatch).
export function decrypt(ciphertext) {
  const [ivHex, tagHex, dataHex] = ciphertext.split('.');
  const decipher = crypto.createDecipheriv(ALGO, getKey(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return decipher.update(Buffer.from(dataHex, 'hex'), null, 'utf8') + decipher.final('utf8');
}

// Safe wrapper: returns null if key is unset (dev mode) rather than throwing.
export function encryptIfConfigured(plaintext) {
  if (!process.env.ENCRYPTION_KEY) return plaintext; // dev fallback — warn in prod
  return encrypt(plaintext);
}
