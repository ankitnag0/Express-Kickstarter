import { UserService } from '../user.service';
import { UserRepository } from '../user.repo';
import { IUser, Role } from '../user.model';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import {
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} from '../../../lib/CustomError';
import { Types } from 'mongoose';

jest.mock('../user.repo');
jest.mock('argon2');
jest.mock('jsonwebtoken');

describe('UserService', () => {
  let userService: UserService;
  let userRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepo = new UserRepository() as jest.Mocked<UserRepository>;
    userService = new UserService(userRepo);
  });

  describe('signUp', () => {
    it('should create a new user when email is unique', async () => {
      userRepo.findUserByEmail.mockResolvedValue(null);
      userRepo.createUser.mockResolvedValue({
        name: 'Test',
        email: 'test@example.com',
        password: 'hashed',
      } as IUser);
      (argon2.hash as jest.Mock).mockResolvedValue('hashed');

      const result = await userService.signUp({
        name: 'Test',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(userRepo.findUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(argon2.hash).toHaveBeenCalledWith('password123');
      expect(userRepo.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test',
          email: 'test@example.com',
          password: 'hashed',
        }),
      );
      expect(result).toEqual(
        expect.objectContaining({ name: 'Test', email: 'test@example.com' }),
      );
    });

    it('should throw ConflictError if user already exists', async () => {
      userRepo.findUserByEmail.mockResolvedValue({} as IUser);

      await expect(
        userService.signUp({
          name: 'Test',
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('signIn', () => {
    it('should return a token if credentials are valid', async () => {
      userRepo.findUserByEmail.mockResolvedValue({
        _id: new Types.ObjectId(),
        password: 'hashed',
      } as IUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('valid-token');

      const result = await userService.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toBe('valid-token');
    });

    it('should throw UnauthorizedError if user does not exist', async () => {
      userRepo.findUserByEmail.mockResolvedValue(null);

      await expect(
        userService.signIn({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError if password is incorrect', async () => {
      userRepo.findUserByEmail.mockResolvedValue({
        password: 'hashed',
      } as IUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        userService.signIn({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('updateNameOrPassword', () => {
    it('should update user name and/or password', async () => {
      const userId = new Types.ObjectId().toHexString();
      userRepo.updateUserById.mockResolvedValue({
        name: 'New Name',
        password: 'new-hashed',
      } as IUser);
      (argon2.hash as jest.Mock).mockResolvedValue('new-hashed');

      const result = await userService.updateNameOrPassword(userId, {
        name: 'New Name',
        password: 'newpass',
      });

      expect(argon2.hash).toHaveBeenCalledWith('newpass');
      expect(userRepo.updateUserById).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ name: 'New Name' }));
    });

    it('should throw NotFoundError if user does not exist', async () => {
      userRepo.updateUserById.mockResolvedValue(null);

      await expect(
        userService.updateNameOrPassword(new Types.ObjectId().toHexString(), {
          name: 'New Name',
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateRole', () => {
    it('should update user role', async () => {
      const userId = new Types.ObjectId().toHexString();
      userRepo.updateUserById.mockResolvedValue({ role: Role.ADMIN } as IUser);

      const result = await userService.updateRole(userId, { role: Role.ADMIN });

      expect(userRepo.updateUserById).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ role: Role.ADMIN }));
    });

    it('should throw NotFoundError if user does not exist', async () => {
      userRepo.updateUserById.mockResolvedValue(null);

      await expect(
        userService.updateRole(new Types.ObjectId().toHexString(), {
          role: Role.ADMIN,
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getAllUsers', () => {
    it('should return a list of users', async () => {
      userRepo.findAllUsers.mockResolvedValue([
        { name: 'User', email: 'user@example.com', role: Role.USER },
      ]);

      const result = await userService.getAllUsers();

      expect(userRepo.findAllUsers).toHaveBeenCalled();
      expect(result).toEqual([
        { name: 'User', email: 'user@example.com', role: Role.USER },
      ]);
    });
  });
});
