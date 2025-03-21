import { cache } from '@config/cache';
import { env } from '@config/env';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '@lib/CustomError';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

import {
  IUser,
  Role,
  SignInInput,
  SignUpInput,
  UpdateNameOrPasswordInput,
  UpdateRoleInput,
  UserRepository,
} from '../types';
import { createUserService } from '../user.service';

jest.mock('argon2', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

jest.mock('@config/cache', () => ({
  cache: {
    invalidate: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
  },
}));

describe('UserService', () => {
  let mockUserRepo: jest.Mocked<UserRepository>;
  let userService: ReturnType<typeof createUserService>;

  beforeEach(() => {
    mockUserRepo = {
      findUserById: jest.fn(),
      findUserByEmail: jest.fn(),
      createUser: jest.fn(),
      updateUserById: jest.fn(),
      findAllUsers: jest.fn(),
      findUsersPaginated: jest.fn(),
    };
    userService = createUserService(mockUserRepo);
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should throw ConflictError if user already exists', async () => {
      const input: SignUpInput = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test',
      };
      mockUserRepo.findUserByEmail.mockResolvedValueOnce({
        _id: new Types.ObjectId(),
        email: input.email,
        password: 'hashedPassword',
        name: input.name,
        role: 'user',
      } as IUser);

      await expect(userService.signUp(input)).rejects.toThrow(ConflictError);
      expect(mockUserRepo.findUserByEmail).toHaveBeenCalledWith(input.email);
      expect(cache.invalidate).not.toHaveBeenCalled();
    });

    it('should create user successfully if user does not exist', async () => {
      const input: SignUpInput = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test',
      };
      mockUserRepo.findUserByEmail.mockResolvedValueOnce(null);
      (argon2.hash as jest.Mock).mockResolvedValueOnce('hashedPassword');

      const createdUser = {
        _id: new Types.ObjectId(),
        email: input.email,
        password: 'hashedPassword',
        name: input.name,
        role: 'user',
      } as IUser;
      mockUserRepo.createUser.mockResolvedValueOnce(createdUser);

      const result = await userService.signUp(input);
      expect(result).toEqual(createdUser);
      expect(argon2.hash).toHaveBeenCalledWith(input.password);
      expect(mockUserRepo.createUser).toHaveBeenCalledWith({
        ...input,
        password: 'hashedPassword',
      });
      expect(cache.invalidate).toHaveBeenCalledWith('users:all');
    });
  });

  describe('signIn', () => {
    it('should throw UnauthorizedError if user does not exist', async () => {
      const input: SignInInput = {
        email: 'test@example.com',
        password: 'password',
      };
      mockUserRepo.findUserByEmail.mockResolvedValueOnce(null);

      await expect(userService.signIn(input)).rejects.toThrow(
        UnauthorizedError,
      );
      expect(mockUserRepo.findUserByEmail).toHaveBeenCalledWith(input.email);
    });

    it('should throw UnauthorizedError if password is invalid', async () => {
      const input: SignInInput = {
        email: 'test@example.com',
        password: 'wrongPassword',
      };
      const user = {
        _id: new Types.ObjectId(),
        email: input.email,
        password: 'hashedPassword',
        name: 'Test',
        role: 'user',
      } as IUser;
      mockUserRepo.findUserByEmail.mockResolvedValueOnce(user);
      (argon2.verify as jest.Mock).mockResolvedValueOnce(false);

      await expect(userService.signIn(input)).rejects.toThrow(
        UnauthorizedError,
      );
      expect(argon2.verify).toHaveBeenCalledWith(user.password, input.password);
    });

    it('should return access and refresh tokens if credentials are valid', async () => {
      // Updated test description
      const input: SignInInput = {
        email: 'test@example.com',
        password: 'password',
      };
      const user = {
        _id: new Types.ObjectId(),
        email: input.email,
        password: 'hashedPassword',
        name: 'Test',
        role: 'user',
      } as IUser;
      mockUserRepo.findUserByEmail.mockResolvedValueOnce(user);
      (argon2.verify as jest.Mock).mockResolvedValueOnce(true);

      const accessToken = 'mockedAccessToken'; // Mocked access token
      const refreshToken = 'mockedRefreshToken'; // Mocked refresh token
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce(accessToken) // Mock generateAccessToken
        .mockReturnValueOnce(refreshToken); // Mock generateRefreshToken

      const tokens = await userService.signIn(input); // Get both tokens
      expect(tokens).toEqual({ accessToken, refreshToken }); // Assert both tokens are returned
      expect(jwt.sign).toHaveBeenCalledTimes(2); // Assert jwt.sign called twice (once for access, once for refresh)

      expect(jwt.sign).toHaveBeenCalledWith(
        // Verify generateAccessToken call
        { id: user._id, role: user.role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRATION },
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        // Verify generateRefreshToken call
        { id: user._id, tokenType: 'refresh' },
        env.JWT_REFRESH_SECRET,
        { expiresIn: env.JWT_REFRESH_EXPIRATION },
      );
    });
  });

  describe('updateNameOrPassword', () => {
    it('should update user name and password if both provided', async () => {
      const userId = new Types.ObjectId().toString();
      const input: UpdateNameOrPasswordInput = {
        name: 'New Name',
        password: 'newPassword',
      };
      (argon2.hash as jest.Mock).mockResolvedValueOnce('newHashedPassword');

      const updatedUser = {
        _id: new Types.ObjectId(userId),
        email: 'test@example.com',
        password: 'newHashedPassword',
        name: 'New Name',
        role: 'user',
      } as IUser;
      mockUserRepo.updateUserById.mockResolvedValueOnce(updatedUser);

      const result = await userService.updateNameOrPassword(userId, input);
      expect(result).toEqual(updatedUser);
      expect(argon2.hash).toHaveBeenCalledWith(input.password);
      expect(mockUserRepo.updateUserById).toHaveBeenCalledWith(
        new Types.ObjectId(userId),
        { name: input.name, password: 'newHashedPassword' },
      );
      expect(cache.invalidate).toHaveBeenCalledWith('users:all');
    });

    it('should update user name only if password is not provided', async () => {
      const userId = new Types.ObjectId().toString();
      const input: UpdateNameOrPasswordInput = {
        name: 'New Name',
      };

      const updatedUser = {
        _id: new Types.ObjectId(userId),
        email: 'test@example.com',
        password: 'existingHashedPassword',
        name: 'New Name',
        role: 'user',
      } as IUser;
      mockUserRepo.updateUserById.mockResolvedValueOnce(updatedUser);

      const result = await userService.updateNameOrPassword(userId, input);
      expect(result).toEqual(updatedUser);
      expect(argon2.hash).not.toHaveBeenCalled();
      expect(mockUserRepo.updateUserById).toHaveBeenCalledWith(
        new Types.ObjectId(userId),
        { name: input.name },
      );
      expect(cache.invalidate).toHaveBeenCalledWith('users:all');
    });

    it('should throw NotFoundError if user is not found', async () => {
      const userId = new Types.ObjectId().toString();
      const input: UpdateNameOrPasswordInput = { name: 'New Name' };
      mockUserRepo.updateUserById.mockResolvedValueOnce(null);

      await expect(
        userService.updateNameOrPassword(userId, input),
      ).rejects.toThrow(NotFoundError);
      expect(mockUserRepo.updateUserById).toHaveBeenCalledWith(
        new Types.ObjectId(userId),
        { name: input.name },
      );
      expect(cache.invalidate).not.toHaveBeenCalled();
    });
  });

  describe('updateRole', () => {
    it('should update user role', async () => {
      const userId = new Types.ObjectId().toString();
      const input: UpdateRoleInput = { role: Role.ADMIN };
      const updatedUser = {
        _id: new Types.ObjectId(userId),
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test',
        role: 'admin',
      } as IUser;
      mockUserRepo.updateUserById.mockResolvedValueOnce(updatedUser);

      const result = await userService.updateRole(userId, input);
      expect(result).toEqual(updatedUser);
      expect(mockUserRepo.updateUserById).toHaveBeenCalledWith(
        new Types.ObjectId(userId),
        { role: input.role },
      );
      expect(cache.invalidate).toHaveBeenCalledWith('users:all');
    });

    it('should throw NotFoundError if user is not found', async () => {
      const userId = new Types.ObjectId().toString();
      const input: UpdateRoleInput = { role: Role.ADMIN };
      mockUserRepo.updateUserById.mockResolvedValueOnce(null);

      await expect(userService.updateRole(userId, input)).rejects.toThrow(
        NotFoundError,
      );
      expect(mockUserRepo.updateUserById).toHaveBeenCalledWith(
        new Types.ObjectId(userId),
        { role: input.role },
      );
      expect(cache.invalidate).not.toHaveBeenCalled();
    });
  });

  describe('getAllUsers', () => {
    it('should return cached users if available', async () => {
      const cachedUsers = [
        { name: 'User1', email: 'user1@example.com', role: Role.USER },
        { name: 'User2', email: 'user2@example.com', role: Role.ADMIN },
      ];
      (cache.get as jest.Mock).mockResolvedValueOnce(cachedUsers);

      const result = await userService.getAllUsers();
      expect(cache.get).toHaveBeenCalledWith('users:all');
      expect(result).toEqual(cachedUsers);
      expect(mockUserRepo.findAllUsers).not.toHaveBeenCalled();
    });

    it('should fetch users from repo, set cache, and return them on cache miss', async () => {
      (cache.get as jest.Mock).mockResolvedValueOnce(null);
      const users = [
        { name: 'User1', email: 'user1@example.com', role: Role.USER },
        { name: 'User2', email: 'user2@example.com', role: Role.ADMIN },
      ];
      mockUserRepo.findAllUsers.mockResolvedValueOnce(users);

      const result = await userService.getAllUsers();
      expect(cache.get).toHaveBeenCalledWith('users:all');
      expect(mockUserRepo.findAllUsers).toHaveBeenCalled();
      expect(cache.set).toHaveBeenCalledWith('users:all', users);
      expect(result).toEqual(users);
    });
  });

  describe('getUsersPaginated', () => {
    it('should return paginated users with correct total count', async () => {
      const users = [
        { name: 'User1', email: 'user1@example.com', role: Role.USER },
        { name: 'User2', email: 'user2@example.com', role: Role.USER },
        { name: 'User3', email: 'user3@example.com', role: Role.USER },
      ];

      (mockUserRepo.findUsersPaginated as jest.Mock).mockResolvedValue({
        users: [users[0]], // For page 1, limit 1
        total: 3,
      });

      const result = await userService.getUsersPaginated(1, 1);
      expect(result.users).toHaveLength(1);
      expect(result.total).toBe(3);
      expect(mockUserRepo.findUsersPaginated).toHaveBeenCalledWith(1, 1);
    });
  });
});
