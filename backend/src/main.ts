const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes/index');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Verbindung zur MongoDB herstellen
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');

    // Middleware zum Verarbeiten von JSON-Daten
    app.use(express.json());
    
    // Alle Routen unter /api verfügbar machen
    app.use('/api', routes);

    // Überprüfen, ob Routen registriert wurden
    const routesExist = app._router.stack.some((middleware: any) => middleware.route);

    if (!routesExist) {
      console.log('Keine Routen wurden registriert!');
    } else {
      app._router.stack.forEach((middleware: any) => {
        if (middleware.route) {
          console.log('Gefundene Route:', middleware.route.path);
        }
      });
    }

    // Server starten
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err: unknown) => {
    console.error('Failed to connect to MongoDB', err);
  });

module.exports = { app };