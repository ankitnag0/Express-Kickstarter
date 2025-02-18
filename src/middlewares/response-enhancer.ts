import { NextFunction, Request, Response } from 'express';

interface ApiResponse<T = unknown> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

export const responseEnhancer = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.success = function <T>(
    data: T,
    status: number = 200,
    message: string = 'Success',
  ) {
    const response: ApiResponse<T> = { success: true, status, message, data };
    this.status(status).json(response);
  };
  next();
};
