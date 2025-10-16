import crypto from 'node:crypto';

const algorithm = 'aes-256-gcm';
const key = crypto
  .createHash('sha256')
  .update(process.env.TOKEN_ENCRYPTION_KEY ?? 'local-dev-secret-key')
  .digest();

export function encrypt(text: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64url');
}

export function decrypt(payload: string) {
  const buffer = Buffer.from(payload, 'base64url');
  const iv = buffer.subarray(0, 16);
  const tag = buffer.subarray(16, 32);
  const data = buffer.subarray(32);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  return decrypted;
}
