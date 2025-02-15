import express from 'express';
import responseEnhancer from './middlewares/response-enhancer';
import errorHandler from './middlewares/error-handler';
import { env } from './config/env';

const app = express();

app.use(express.json());
app.use(responseEnhancer);

app.get('/', (req, res) => {
  res.success({ message: 'Hello, World!' }, 200, 'Api is working!');
});

app.use(errorHandler);

const PORT = env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
