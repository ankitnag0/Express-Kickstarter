namespace Express {
  interface Request {
    user?: { id: string; role: string };
  }

  interface Response {
    success: <T>(data: T, status?: number, message?: string) => void;
  }
}
