import mongoose from 'mongoose';

const dbUri = process.env.DB_URI || 'mongodb://localhost:27017/database'; // MongoDB-URI

// Verbindung herstellen
mongoose
    .connect(dbUri, {
        useUnifiedTopology: true,
    } as mongoose.ConnectOptions)
    .then(() => {
        console.log('Datenbankverbindung erfolgreich.');
    })
    .catch((error) => {
        console.error('Datenbankverbindung fehlgeschlagen:', error);
    });

export default mongoose;
