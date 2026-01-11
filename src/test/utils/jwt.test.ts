import { describe, it, expect, beforeEach } from 'vitest';
import { signToken, verifyToken } from '../../server/utils/jwt';
import type { JwtPayload } from '../../server/utils/jwt';

describe('JWT Utils', () => {
  const mockPayload: JwtPayload = {
    userId: 1,
    username: 'testuser',
  };

  describe('signToken', () => {
    it('should create a valid JWT token', () => {
      const token = signToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should create tokens that can be decoded with correct payload', () => {
      const token = signToken(mockPayload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.username).toBe(mockPayload.username);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token and return payload', () => {
      const token = signToken(mockPayload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.username).toBe(mockPayload.username);
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyToken('invalid-token')).toThrow('Invalid or expired token');
    });

    it('should throw error for malformed token', () => {
      expect(() => verifyToken('not.a.jwt')).toThrow('Invalid or expired token');
    });

    it('should throw error for empty token', () => {
      expect(() => verifyToken('')).toThrow('Invalid or expired token');
    });

    it('should verify token with correct payload structure', () => {
      const payload: JwtPayload = {
        userId: 123,
        username: 'anotheruser',
      };

      const token = signToken(payload);
      const decoded = verifyToken(token);

      expect(decoded).toMatchObject(payload);
    });
  });

  describe('Token Lifecycle', () => {
    it('should create and verify token successfully', () => {
      const payload: JwtPayload = {
        userId: 999,
        username: 'lifecycletest',
      };

      const token = signToken(payload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.username).toBe(payload.username);
    });
  });
});
