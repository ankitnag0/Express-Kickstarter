namespace Express {
  interface Request {
    user?: { id: string; role: string };
  }

  interface ApiResponse<T = any> {
    success: boolean;
    status: number;
    message: string;
    data: T;
  }

  interface Response {
    success: <T>(data: T, status?: number, message?: string) => void;
  }
}
