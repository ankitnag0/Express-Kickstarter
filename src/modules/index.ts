import { Router } from 'express';

import userRouter from './user/user.router';

export const indexRouter = Router();

indexRouter.use('/user', userRouter);
