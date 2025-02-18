import { createUserRepository } from '../user.repo'; // Updated import for factory
import { Role } from '../user.model';
import mongoose, { Types } from 'mongoose';

let userRepository = createUserRepository(); // Use factory function

beforeAll(() => {
  userRepository = createUserRepository();
});

beforeEach(async () => {
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
});

describe('UserRepository', () => {
  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      };

      const user = await userRepository.createUser(userData);

      expect(user).toHaveProperty('_id');
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe(Role.USER);
    });

    it('should set the correct role if provided', async () => {
      const userData = {
        name: 'Admin User',
        email: 'admin.user@example.com',
        password: 'admin123',
        role: Role.ADMIN,
      };

      const user = await userRepository.createUser(userData);

      expect(user.role).toBe(Role.ADMIN);
    });
  });

  describe('updateUserById', () => {
    it('should update user by ID successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      };

      const user = await userRepository.createUser(userData);

      const updateData = {
        name: 'John Updated',
        role: Role.ADMIN,
      };

      const updatedUser = await userRepository.updateUserById(
        user._id,
        updateData,
      );

      expect(updatedUser).not.toBeNull();
      expect(updatedUser?.name).toBe(updateData.name);
      expect(updatedUser?.role).toBe(updateData.role);
    });

    it('should return null if user not found', async () => {
      const nonExistentUserId = new Types.ObjectId();
      const updateData = { name: 'Nonexistent User' };

      const updatedUser = await userRepository.updateUserById(
        nonExistentUserId,
        updateData,
      );

      expect(updatedUser).toBeNull();
    });
  });

  describe('findUserById', () => {
    it('should find a user by ID', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        password: 'password123',
      };

      const user = await userRepository.createUser(userData);

      const foundUser = await userRepository.findUserById(user._id);

      expect(foundUser).not.toBeNull();
      expect(foundUser?._id.toString()).toBe(user._id.toString());
      expect(foundUser?.name).toBe(userData.name);
    });

    it('should return null if user not found', async () => {
      const nonExistentUserId = new Types.ObjectId();

      const foundUser = await userRepository.findUserById(nonExistentUserId);

      expect(foundUser).toBeNull();
    });
  });

  describe('findUserByEmail', () => {
    it('should find a user by email', async () => {
      const userData = {
        name: 'Mike Tyson',
        email: 'mike.tyson@example.com',
        password: 'password123',
      };

      const user = await userRepository.createUser(userData);

      const foundUser = await userRepository.findUserByEmail(user.email);

      expect(foundUser).not.toBeNull();
      expect(foundUser?.email).toBe(userData.email);
    });

    it('should return null if user not found', async () => {
      const foundUser = await userRepository.findUserByEmail(
        'nonexistent@example.com',
      );

      expect(foundUser).toBeNull();
    });
  });

  describe('findAllUsers', () => {
    it('should return a list of users with only name, email, and role', async () => {
      const userData1 = {
        name: 'Alice Smith',
        email: 'alice.smith@example.com',
        password: 'password123',
      };
      const userData2 = {
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        password: 'password123',
      };

      await userRepository.createUser(userData1);
      await userRepository.createUser(userData2);

      const users = await userRepository.findAllUsers();

      expect(users).toHaveLength(2);
      users.forEach((user) => {
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('role');
      });

      expect(users[0].name).toBe(userData1.name);
      expect(users[0].email).toBe(userData1.email);
      expect(users[0].role).toBe(Role.USER);
      expect(users[1].name).toBe(userData2.name);
      expect(users[1].email).toBe(userData2.email);
      expect(users[1].role).toBe(Role.USER);
    });
  });
});
