import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import routes from './routes/index';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3000;

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log('Connected to MongoDB');
    app.use(express.json());
    app.use('/api', routes);

    // Überprüfen, ob Routen registriert sind
    const routesExist = app._router.stack.some((middleware: any) => {
      return middleware.route || (middleware.name === 'router' && middleware.handle.stack.length > 0);
    });
    if (!routesExist) console.warn('No routes registered.');

    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  })
  .catch((error: any) => {
    console.error('Failed to connect to MongoDB', error);
  });