import { pbkdf2Sync, randomBytes } from 'crypto';

export const hashPassword = (password: string, salt: string): string => {
  return pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
};

export const generateSalt = (): string => {
  return randomBytes(16).toString('hex');
};

export const verifyPassword = (password: string, hash: string, salt: string): boolean => {
  const hashedPassword = hashPassword(password, salt);
  return hashedPassword === hash;
};