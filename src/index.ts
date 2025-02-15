import app from './app';
import { env } from './config/env';

// Start the Server
const PORT = env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
