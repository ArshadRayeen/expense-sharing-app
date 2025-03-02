import { SHA256 } from 'crypto-js';

export const hashPassword = async (password: string): Promise<string> => {
  // Simple SHA-256 hashing
  return SHA256(password).toString();
};

export const comparePasswords = async (password: string, hashedPassword: string): Promise<boolean> => {
  const hashed = await hashPassword(password);
  return hashed === hashedPassword;
}; 