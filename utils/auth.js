import crypto from 'crypto'

const base64URLEncode = (str) => {
    return str.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

const sha256 = (buffer) => crypto.createHash('sha256').update(buffer).digest();

export const createVerifier = () => base64URLEncode(crypto.randomBytes(32));

export const createChallenge = (verifier) => base64URLEncode(sha256(verifier));