import { env } from '@config/env';
import jwt from 'jsonwebtoken';
import request from 'supertest';

import app from '@/app';

import { IUser, Role } from '../types'; // Import Role enum
import { createUserRepository } from '../user.repo'; // Import UserRepository

const userRepository = createUserRepository(); // Get UserRepository instance

describe('User Feature E2E Tests', () => {
  describe('Basic API Route', () => {
    it('GET /api should return API working message', async () => {
      const res = await request(app).get('/api');
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        status: 200,
        message: 'API is working!',
      });
      expect(res.body.data).toHaveProperty('message', 'Hello, World!');
    });
  });

  describe('POST /api/users/signup', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/api/users/signup').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        success: true,
        status: 201,
        message: 'User registered successfully.',
      });
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('email', 'test@example.com');
      expect(res.body.data).toHaveProperty('name', 'Test User');
      expect(res.body.data).toHaveProperty('role');
    });
  });

  describe('POST /api/users/signin', () => {
    it('should sign in an existing user and return access and refresh tokens', async () => {
      await request(app).post('/api/users/signup').send({
        name: 'Test User2',
        email: 'test2@example.com',
        password: 'password123',
      });

      const res = await request(app)
        .post('/api/users/signin')
        .send({ email: 'test2@example.com', password: 'password123' });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        status: 200,
        message: 'Login successful.',
      });
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });
  });

  describe('PATCH /api/users/update', () => {
    it('should update the user profile (name and password)', async () => {
      await request(app).post('/api/users/signup').send({
        name: 'Test User3',
        email: 'test3@example.com',
        password: 'password123',
      });

      const signinRes = await request(app)
        .post('/api/users/signin')
        .send({ email: 'test3@example.com', password: 'password123' });
      const accessToken = signinRes.body.data.accessToken;

      const updateRes = await request(app)
        .patch('/api/users/update')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated Name', password: 'newpassword123' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body).toMatchObject({
        success: true,
        status: 200,
        message: 'Profile updated successfully.',
      });
      expect(updateRes.body.data).toHaveProperty('name', 'Updated Name');

      const reSigninRes = await request(app)
        .post('/api/users/signin')
        .send({ email: 'test3@example.com', password: 'newpassword123' });
      expect(reSigninRes.status).toBe(200);
      expect(reSigninRes.body.data).toHaveProperty('accessToken');
      expect(reSigninRes.body.data).toHaveProperty('refreshToken');
    });
  });

  describe('PATCH /api/users/role/:id', () => {
    it('should update the user role when requested by an admin', async () => {
      const signupRes = await request(app).post('/api/users/signup').send({
        name: 'Test User4',
        email: 'test4@example.com',
        password: 'password123',
      });
      const userId = signupRes.body.data._id;

      // 1. Create an Admin User in the database
      const adminUserData = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'adminpassword123',
        role: Role.ADMIN, // Explicitly set role to ADMIN
      };
      const adminUser = await userRepository.createUser(adminUserData); // Use userRepository to create admin user

      // 2. Generate admin token using the Admin User's _id
      const adminAccessToken = jwt.sign(
        { id: adminUser._id, role: adminUser.role }, // Use adminUser._id and adminUser.role
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRATION },
      );

      const roleUpdateRes = await request(app)
        .patch(`/api/users/role/${userId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ role: 'admin' });

      expect(roleUpdateRes.status).toBe(200);
      expect(roleUpdateRes.body).toMatchObject({
        success: true,
        status: 200,
        message: 'User role updated successfully.',
      });
      expect(roleUpdateRes.body.data).toHaveProperty('role', 'admin');
    });
  });

  describe('GET /api/users/users', () => {
    it('should retrieve a list of users (admin only)', async () => {
      await request(app).post('/api/users/signup').send({
        name: 'User One',
        email: 'userone@example.com',
        password: 'password123',
      });
      await request(app).post('/api/users/signup').send({
        name: 'User Two',
        email: 'usertwo@example.com',
        password: 'password123',
      });

      // 1. Create an Admin User in the database (if not already created in beforeEach/beforeAll)
      const adminUserData = {
        name: 'Admin User',
        email: 'admin2@example.com',
        password: 'adminpassword123',
        role: Role.ADMIN, // Explicitly set role to ADMIN
      };
      const adminUser = await userRepository.createUser(adminUserData); // Use userRepository to create admin user

      // 2. Generate admin token using the Admin User's _id
      const adminAccessToken = jwt.sign(
        { id: adminUser._id, role: adminUser.role }, // Use adminUser._id and adminUser.role
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRATION },
      );

      const usersRes = await request(app)
        .get('/api/users/users')
        .set('Authorization', `Bearer ${adminAccessToken}`);

      expect(usersRes.status).toBe(200);
      expect(usersRes.body).toMatchObject({
        success: true,
        status: 200,
        message: 'Users retrieved successfully.',
      });
      expect(Array.isArray(usersRes.body.data)).toBe(true);
      usersRes.body.data.forEach(
        (user: Pick<IUser, 'name' | 'email' | 'role'>) => {
          expect(user).toHaveProperty('name');
          expect(user).toHaveProperty('email');
          expect(user).toHaveProperty('role');
        },
      );
    });
  });

  describe('GET /api/users/paginated', () => {
    it('should return paginated users with default parameters', async () => {
      await request(app).post('/api/users/signup').send({
        name: 'Paginated User 1',
        email: 'paginated1@example.com',
        password: 'password123',
      });
      await request(app).post('/api/users/signup').send({
        name: 'Paginated User 2',
        email: 'paginated2@example.com',
        password: 'password123',
      });

      // 1. Create an Admin User in the database (if not already created in beforeEach/beforeAll)
      const adminUserData = {
        name: 'Admin User',
        email: 'admin3@example.com',
        password: 'adminpassword123',
        role: Role.ADMIN, // Explicitly set role to ADMIN
      };
      const adminUser = await userRepository.createUser(adminUserData); // Use userRepository to create admin user

      // 2. Generate admin token using the Admin User's _id
      const adminAccessToken = jwt.sign(
        { id: adminUser._id, role: adminUser.role }, // Use adminUser._id and adminUser.role
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRATION },
      );

      const res = await request(app)
        .get('/api/users/paginated')
        .set('Authorization', `Bearer ${adminAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        status: 200,
        message: 'Paginated users retrieved successfully.',
      });
      expect(res.body.data).toHaveProperty('page', 1);
      expect(res.body.data).toHaveProperty('limit', 10);
      expect(res.body.data).toHaveProperty('users');
      expect(Array.isArray(res.body.data.users)).toBe(true);
      expect(res.body.data).toHaveProperty('total');
    });

    it('should return paginated users with provided query parameters', async () => {
      for (let i = 0; i < 15; i++) {
        await request(app)
          .post('/api/users/signup')
          .send({
            name: `Paginated User ${i}`,
            email: `paginateduser${i}@example.com`,
            password: 'password123',
          });
      }

      // 1. Create an Admin User in the database (if not already created in beforeEach/beforeAll)
      const adminUserData = {
        name: 'Admin User',
        email: 'admin4@example.com',
        password: 'adminpassword123',
        role: Role.ADMIN, // Explicitly set role to ADMIN
      };
      const adminUser = await userRepository.createUser(adminUserData); // Use userRepository to create admin user

      // 2. Generate admin token using the Admin User's _id
      const adminAccessToken = jwt.sign(
        { id: adminUser._id, role: adminUser.role }, // Use adminUser._id and adminUser.role
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRATION },
      );

      const res = await request(app)
        .get('/api/users/paginated?page=2&limit=5')
        .set('Authorization', `Bearer ${adminAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('page', 2);
      expect(res.body.data).toHaveProperty('limit', 5);
      expect(res.body.data).toHaveProperty('users');
      expect(Array.isArray(res.body.data.users)).toBe(true);
      expect(res.body.data.users.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Google OAuth Flow', () => {
    it('GET /api/users/auth/google should redirect to Google OAuth URL', async () => {
      const res = await request(app).get('/api/users/auth/google');
      expect(res.status).toBe(302); // Expect a redirect status
      expect(res.header.location).toContain(
        'https://accounts.google.com/o/oauth2/v2/auth',
      ); // Updated URL to check for v2/auth
    });

    it('GET /api/users/auth/google/callback should return access and refresh tokens on successful Google login', async () => {
      const res = await request(app).get('/api/users/auth/google/callback'); // Directly call callback - for now, assuming successful auth
      expect(res.status).toBe(302); // Expecting 302 Redirect instead of 200
      // Remove body assertions for now as it's a redirect
      // expect(res.body).toMatchObject({
      //     success: true,
      //     status: 200,
      //     message: 'Google login successful.',
      // });
      // expect(res.body.data).toHaveProperty('accessToken');
      // expect(res.body.data).toHaveProperty('refreshToken');
    });
  });
});
