import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../shared/logger.service';
import { UnauthorizedException } from '@nestjs/common';
import { Provider } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: jest.Mocked<JwtService>;
  let loggerService: jest.Mocked<LoggerService>;

  const mockDate = new Date('2024-01-01T12:00:00Z');

  const mockUser = {
    id: 'test-id',
    email: 'test@example.com',
    name: 'Test User',
    avatar: 'test-avatar.jpg',
    provider: Provider.GOOGLE,
    providerId: 'google-123',
    lastLoginAt: mockDate,
    createdAt: mockDate,
    updatedAt: mockDate
  };

  const mockProfile = {
    id: 'google-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    picture: 'test-avatar.jpg',
    provider: Provider.GOOGLE
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        upsert: jest.fn()
      }
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn()
          }
        },
        {
          provide: LoggerService,
          useValue: {
            error: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);
    loggerService = module.get(LoggerService);

    // Mock Date.now
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('validateToken', () => {
    const selectedUserFields = {
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      avatar: mockUser.avatar,
      provider: mockUser.provider,
      lastLoginAt: mockUser.lastLoginAt
    };

    it('should validate user token successfully', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(selectedUserFields);

      const result = await service.validateToken('test-id');

      expect(result).toEqual(selectedUserFields);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          provider: true,
          lastLoginAt: true
        }
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      let error: Error | null = null;
      try {
        await service.validateToken('test-id');
      } catch (e) {
        error = e;
      }

      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error?.message).toBe('User not found');
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          provider: true,
          lastLoginAt: true
        }
      });
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database error');
      (prismaService.user.findUnique as jest.Mock).mockRejectedValue(dbError);

      let error: Error | null = null;
      try {
        await service.validateToken('test-id');
      } catch (e) {
        error = e;
      }

      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error?.message).toBe('Invalid token');
      expect(loggerService.error).toHaveBeenCalledWith(
        'Token validation failed',
        dbError.stack,
        'AuthService'
      );
    });
  });

  describe('socialLogin', () => {
    const mockToken = 'test-token';
    const mockLoginResponse = {
      access_token: mockToken,
      user: {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        avatar: mockUser.avatar,
        provider: mockUser.provider
      }
    };

    beforeEach(() => {
      (jwtService.sign as jest.Mock).mockReturnValue(mockToken);
    });

    it('should handle successful social login with new user', async () => {
      (prismaService.user.upsert as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.socialLogin(mockProfile);

      expect(result).toEqual(mockLoginResponse);
      expect(prismaService.user.upsert).toHaveBeenCalledWith({
        where: { email: mockProfile.email },
        update: {
          lastLoginAt: mockDate,
          name: 'Test User',
          avatar: mockProfile.picture,
          providerId: mockProfile.id
        },
        create: {
          email: mockProfile.email,
          name: 'Test User',
          avatar: mockProfile.picture,
          provider: Provider.GOOGLE,
          providerId: mockProfile.id,
          lastLoginAt: mockDate
        }
      });
      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          sub: mockUser.id,
          email: mockUser.email,
          provider: mockUser.provider
        },
        { expiresIn: '1d' }
      );
    });

    it('should handle successful social login with existing user', async () => {
      const existingUser = { ...mockUser };
      (prismaService.user.upsert as jest.Mock).mockResolvedValue(existingUser);

      const result = await service.socialLogin(mockProfile);

      expect(result).toEqual(mockLoginResponse);
    });

    it('should throw error when email is missing', async () => {
      const invalidProfile = { ...mockProfile, email: undefined };

      let error: Error | null = null;
      try {
        await service.socialLogin(invalidProfile);
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error?.message).toBe('Email is required');
    });

    it('should handle database errors during social login', async () => {
      const dbError = new Error('Database error');
      (prismaService.user.upsert as jest.Mock).mockRejectedValue(dbError);

      let error: Error | null = null;
      try {
        await service.socialLogin(mockProfile);
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error?.message).toBe('Database error');
      expect(loggerService.error).toHaveBeenCalledWith(
        'Social login failed',
        dbError.stack,
        'AuthService'
      );
    });
  });
});
