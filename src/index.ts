import express from 'express';
import responseEnhancer from './middlewares/response-enhancer';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(responseEnhancer);

app.get('/', (req, res) => {
  // res.send("Hello, World!");
  res.success(
    {
      message: 'what is up',
    },
    200,
    'fuck you mean',
  );
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
