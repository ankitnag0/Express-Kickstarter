import { Router } from 'express';

import userRouter from './user/user.router';

export const indexRouter = Router();

indexRouter.get('/', (req, res) => {
  res.success({ message: 'Hello, World!' }, 200, 'API is working!');
});

indexRouter.use('/users', userRouter);
