// src/modules/user/test/user.e2e.test.ts

import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../app';
import { env } from '../../../config/env';
import { IUser } from '../types';

describe('User Feature E2E Tests', () => {
  /**
   * Global setup (via setup-test.ts) takes care of MongoMemoryServer and DB cleanup.
   */

  describe('Basic API Route', () => {
    it('GET / should return API working message', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        status: 200,
        message: 'API is working!',
      });
      expect(res.body.data).toHaveProperty('message', 'Hello, World!');
    });
  });

  describe('POST /api/user/signup', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/api/user/signup').send({
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
      expect(res.body.data).toHaveProperty('role'); // Typically "user"
    });
  });

  describe('POST /api/user/signin', () => {
    it('should sign in an existing user and return a token', async () => {
      // First, create a user
      await request(app).post('/api/user/signup').send({
        name: 'Test User2',
        email: 'test2@example.com',
        password: 'password123',
      });

      // Now, sign in with that user's credentials
      const res = await request(app)
        .post('/api/user/signin')
        .send({ email: 'test2@example.com', password: 'password123' });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        status: 200,
        message: 'Login successful.',
      });
      expect(res.body.data).toHaveProperty('token');
    });
  });

  describe('PATCH /api/user/update', () => {
    it('should update the user profile (name and password)', async () => {
      // Sign up a user
      await request(app).post('/api/user/signup').send({
        name: 'Test User3',
        email: 'test3@example.com',
        password: 'password123',
      });

      // Sign in to obtain a token
      const signinRes = await request(app)
        .post('/api/user/signin')
        .send({ email: 'test3@example.com', password: 'password123' });
      const token = signinRes.body.data.token;

      // Update profile (name and password)
      const updateRes = await request(app)
        .patch('/api/user/update')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name', password: 'newpassword123' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body).toMatchObject({
        success: true,
        status: 200,
        message: 'Profile updated successfully.',
      });
      expect(updateRes.body.data).toHaveProperty('name', 'Updated Name');

      // Verify new password works by signing in with it
      const reSigninRes = await request(app)
        .post('/api/user/signin')
        .send({ email: 'test3@example.com', password: 'newpassword123' });
      expect(reSigninRes.status).toBe(200);
      expect(reSigninRes.body.data).toHaveProperty('token');
    });
  });

  describe('PATCH /api/user/role/:id', () => {
    it('should update the user role when requested by an admin', async () => {
      // Create a regular user first
      const signupRes = await request(app).post('/api/user/signup').send({
        name: 'Test User4',
        email: 'test4@example.com',
        password: 'password123',
      });

      const userId = signupRes.body.data._id;

      // Generate an admin token manually (payload should match authMiddleware requirements)
      const adminToken = jwt.sign(
        { id: 'admin', role: 'admin' },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRATION },
      );

      const roleUpdateRes = await request(app)
        .patch(`/api/user/role/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
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

  describe('GET /api/user/users', () => {
    it('should retrieve a list of users (admin only)', async () => {
      // Create two users
      await request(app).post('/api/user/signup').send({
        name: 'User One',
        email: 'userone@example.com',
        password: 'password123',
      });
      await request(app).post('/api/user/signup').send({
        name: 'User Two',
        email: 'usertwo@example.com',
        password: 'password123',
      });

      // Generate an admin token
      const adminToken = jwt.sign(
        { id: 'admin', role: 'admin' },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRATION },
      );

      const usersRes = await request(app)
        .get('/api/user/users')
        .set('Authorization', `Bearer ${adminToken}`);

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
});
