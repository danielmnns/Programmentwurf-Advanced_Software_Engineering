import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import routes from './routes/index';
import initializeAdminUser from './utils/initializeAdmin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware zum Verarbeiten von JSON-Daten
app.use(express.json());

// Alle Routen unter /api verfügbar machen
app.use('/api', routes);

// Verbindung zur MongoDB herstellen
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected to MongoDB');

    await initializeAdminUser();

    // Server starten
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
  }
};

startServer();

export default app;