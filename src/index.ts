import 'express-async-errors';
import express from 'express';
import responseEnhancer from './middlewares/response-enhancer';
import errorHandler from './middlewares/error-handler';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(responseEnhancer);

// Test Route: Success Response
app.get('/', (req, res) => {
  res.success(
    {
      message: 'Hello, World!',
    },
    200,
    'Success!',
  );
});

// Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
