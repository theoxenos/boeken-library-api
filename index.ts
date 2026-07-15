import 'dotenv/config';
import app from './src/app.ts';

const port = process.env.PORT ?? 3000;

app.listen(port, () => {
  console.info(`Server is running at http://localhost:${port}`);
});