import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import routes from './routes/index';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware zum Verarbeiten von JSON-Daten
app.use(express.json());

// Alle Routen unter /api verfügbar machen
app.use('/api', routes);

// Verbindung zur MongoDB herstellen
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    console.log('Connected to MongoDB');
    // Server starten
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err: unknown) => {
    console.error('Failed to connect to MongoDB', err);
  });

export default app;